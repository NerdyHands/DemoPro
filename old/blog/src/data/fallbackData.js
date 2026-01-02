// Fallback data based on the Google Sheets content
export const fallbackBlogPosts = [
  {
    id: 1,
    company: 'Affordable AI Tools for Small Business',
    title: 'Affordable AI Tools for Small Business',
    slug: 'affordable-ai-tools',
    coverImageURL: 'https://image.url',
    author: 'Wayne',
    tags: ['AI', 'Small Business'],
    metaDescription: 'Save time & money with AI tools',
    publishDate: '2025-08-20',
    status: 'Published',
    content: `
      <h2>Affordable AI Tools for Small Business</h2>
      <p>Discover how small businesses can leverage affordable AI tools to streamline operations, reduce costs, and improve productivity.</p>
      
      <h3>Why AI for Small Business?</h3>
      <p>Artificial Intelligence is no longer just for large corporations. Small businesses can now access powerful AI tools at affordable prices to:</p>
      <ul>
        <li>Automate repetitive tasks</li>
        <li>Improve customer service</li>
        <li>Enhance marketing efforts</li>
        <li>Optimize business processes</li>
        <li>Make data-driven decisions</li>
      </ul>
      
      <h3>Top Affordable AI Tools</h3>
      <p>Here are some of the most cost-effective AI tools that small businesses can start using today:</p>
      
      <h4>1. Chatbots for Customer Service</h4>
      <p>Implement AI-powered chatbots to handle customer inquiries 24/7, reducing response times and improving customer satisfaction.</p>
      
      <h4>2. Content Creation Tools</h4>
      <p>Use AI to generate blog posts, social media content, and marketing copy, saving hours of manual work.</p>
      
      <h4>3. Data Analysis Platforms</h4>
      <p>Leverage AI to analyze customer data, market trends, and business performance metrics.</p>
      
      <h3>Getting Started</h3>
      <p>To successfully implement AI in your small business:</p>
      <ol>
        <li>Identify areas where automation can save time</li>
        <li>Start with simple, low-cost tools</li>
        <li>Train your team on new technologies</li>
        <li>Measure results and iterate</li>
      </ol>
      
      <p>By embracing affordable AI tools, small businesses can compete more effectively in today's digital marketplace while maintaining lean operations and budgets.</p>
    `,
    excerpt: 'Save time & money with AI tools',
    category: 'Affordable AI Tools for Small Business',
    readTime: '5 min read',
    featured: true
  }
];

// Helper function to get fallback data
export const getFallbackBlogPosts = () => fallbackBlogPosts;

export const getFallbackBlogPostBySlug = (slug) => {
  return fallbackBlogPosts.find(post => post.slug === slug) || null;
};

export const getFallbackFeaturedPosts = () => {
  return fallbackBlogPosts.filter(post => post.featured).slice(0, 3);
};
