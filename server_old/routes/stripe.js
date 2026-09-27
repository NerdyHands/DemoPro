const express = require('express');
const router = express.Router();
const stripe = require('stripe');

let stripeClient = null;

// Initialize Stripe client only when needed
const getStripe = () => {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }
    stripeClient = stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
};
const { body, validationResult } = require('express-validator');

// Middleware to validate Stripe webhook signature
const validateWebhook = (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  req.stripeEvent = event;
  next();
};

// Create a payment intent
router.post('/create-payment-intent', [
  body('amount').isInt({ min: 50 }).withMessage('Amount must be at least 50 cents'),
  body('currency').isIn(['usd', 'eur', 'gbp']).withMessage('Invalid currency'),
  body('description').optional().isString().trim(),
  body('metadata').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency = 'usd', description, metadata } = req.body;

    const paymentIntent = await getStripe().paymentIntents.create({
      amount,
      currency,
      description,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Create a subscription
router.post('/create-subscription', [
  body('customerId').isString().withMessage('Customer ID is required'),
  body('priceId').isString().withMessage('Price ID is required'),
  body('paymentMethodId').optional().isString(),
  body('trialDays').optional().isInt({ min: 0, max: 30 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerId, priceId, paymentMethodId, trialDays } = req.body;

    const subscriptionData = {
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
    };

    if (trialDays) {
      subscriptionData.trial_period_days = trialDays;
    }

    if (paymentMethodId) {
      subscriptionData.default_payment_method = paymentMethodId;
    }

    const subscription = await getStripe().subscriptions.create(subscriptionData);

    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      clientSecret: subscription.latest_invoice?.payment_intent?.client_secret
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Create a customer
router.post('/create-customer', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').optional().isString().trim(),
  body('phone').optional().isString().trim(),
  body('metadata').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, phone, metadata } = req.body;

    const customer = await getStripe().customers.create({
      email,
      name,
      phone,
      metadata
    });

    res.json({
      customerId: customer.id,
      email: customer.email,
      name: customer.name
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Get customer subscriptions
router.get('/customer/:customerId/subscriptions', async (req, res) => {
  try {
    const { customerId } = req.params;

    const subscriptions = await getStripe().subscriptions.list({
      customer: customerId,
      status: 'all',
      expand: ['data.default_payment_method']
    });

    res.json(subscriptions.data);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

// Cancel subscription
router.post('/subscriptions/:subscriptionId/cancel', [
  body('cancelAtPeriodEnd').optional().isBoolean()
], async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { cancelAtPeriodEnd = true } = req.body;

    const subscription = await getStripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd
    });

    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Reactivate subscription
router.post('/subscriptions/:subscriptionId/reactivate', async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await getStripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    });

    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// Get payment methods for customer
router.get('/customers/:customerId/payment-methods', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { type = 'card' } = req.query;

    const paymentMethods = await getStripe().paymentMethods.list({
      customer: customerId,
      type
    });

    res.json(paymentMethods.data);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Attach payment method to customer
router.post('/customers/:customerId/payment-methods', [
  body('paymentMethodId').isString().withMessage('Payment method ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerId } = req.params;
    const { paymentMethodId } = req.body;

    const paymentMethod = await getStripe().paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    res.json(paymentMethod);
  } catch (error) {
    console.error('Error attaching payment method:', error);
    res.status(500).json({ error: 'Failed to attach payment method' });
  }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), validateWebhook, async (req, res) => {
  const event = req.stripeEvent;

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        // Handle successful payment
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);
        // Handle failed payment
        break;

      case 'customer.subscription.created':
        const newSubscription = event.data.object;
        console.log('Subscription created:', newSubscription.id);
        // Handle new subscription
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object;
        console.log('Subscription updated:', updatedSubscription.id);
        // Handle subscription update
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription deleted:', deletedSubscription.id);
        // Handle subscription deletion
        break;

      case 'invoice.payment_succeeded':
        const successfulInvoice = event.data.object;
        console.log('Invoice payment succeeded:', successfulInvoice.id);
        // Handle successful invoice payment
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        console.log('Invoice payment failed:', failedInvoice.id);
        // Handle failed invoice payment
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Get available products and prices
router.get('/products', async (req, res) => {
  try {
    const products = await getStripe().products.list({
      active: true,
      expand: ['data.default_price']
    });

    res.json(products.data);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get specific product with prices
router.get('/products/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await getStripe().products.retrieve(productId, {
      expand: ['default_price']
    });

    const prices = await getStripe().prices.list({
      product: productId,
      active: true
    });

    res.json({
      product,
      prices: prices.data
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router; 