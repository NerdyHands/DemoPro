// import { Container, Row, Col } from 'react-bootstrap';
// import { Link } from 'react-router-dom';
// import { motion } from 'framer-motion';

// const CabinetRemoval = () => {
//   return (
//     <div style={{ paddingTop: '100px' }}>
//       {/* Hero Section */}
//       <section style={{ 
//         backgroundColor: 'var(--color-primary)', 
//         padding: '80px 0',
//         color: 'white'
//       }}>
//         <Container>
//           <Row className="align-items-center">
//             <Col lg={6} md={12} className="mb-5 mb-lg-0">
//               <motion.h1 
//                 className="display-4 fw-bold mb-4"
//                 initial={{ opacity: 0, x: -50 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.6 }}
//               >
//                 Cabinet Removal Services
//               </motion.h1>
//               <motion.p 
//                 className="lead mb-4"
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3, duration: 0.6 }}
//               >
//                 Expert kitchen and bathroom cabinet removal services in Hampton Roads, VA. 
//                 We carefully remove cabinets while preserving your walls and flooring for your next renovation project.
//               </motion.p>
//               <motion.div
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ delay: 0.6, duration: 0.6 }}
//               >
//                 <a 
//                   href="tel:757-848-4559" 
//                   className="btn btn-light btn-lg me-3 mb-3"
//                   style={{ fontWeight: 'bold' }}
//                 >
//                   📞 Call 757-848-4559
//                 </a>
//                 <Link to="/contact" className="btn btn-outline-light btn-lg mb-3">
//                   Get Free Quote
//                 </Link>
//               </motion.div>
//             </Col>
//             <Col lg={6} md={12}>
//               <motion.img 
//                 src="/assets/img/services/cabinet-removal.jpg"
//                 alt="Cabinet removal services by Mr Demo Pro"
//                 className="img-fluid rounded"
//                 initial={{ opacity: 0, x: 50 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.2, duration: 0.6 }}
//                 style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
//               />
//             </Col>
//           </Row>
//         </Container>
//       </section>

//       {/* Services Overview */}
//       <section style={{ padding: '80px 0' }}>
//         <Container>
//           <Row>
//             <Col xs={12} className="text-center mb-5">
//               <motion.h2 
//                 className="display-5 fw-bold mb-4"
//                 initial={{ opacity: 0 }}
//                 whileInView={{ opacity: 1 }}
//                 transition={{ duration: 0.6 }}
//                 style={{ color: 'var(--color-primary)' }}
//               >
//                 Cabinet Removal Services
//               </motion.h2>
//             </Col>
//           </Row>
//           <Row>
//             <Col lg={4} md={6} className="mb-4">
//               <motion.div 
//                 className="text-center p-4 h-100"
//                 initial={{ opacity: 0, y: 50 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2, duration: 0.5 }}
//                 style={{ 
//                   backgroundColor: 'var(--color-surface)',
//                   borderRadius: '12px',
//                   boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
//                 }}
//               >
//                 <div className="mb-3">
//                   <img 
//                     src="/assets/Icons/kitchen-cabinet.png" 
//                     alt="Kitchen cabinet removal"
//                     width="80" 
//                     height="80" 
//                   />
//                 </div>
//                 <h4 className="fw-bold mb-3">Kitchen Cabinet Removal</h4>
//                 <p>Complete removal of kitchen cabinets, including upper and lower cabinets, with careful attention to plumbing and electrical connections.</p>
//               </motion.div>
//             </Col>
//             <Col lg={4} md={6} className="mb-4">
//               <motion.div 
//                 className="text-center p-4 h-100"
//                 initial={{ opacity: 0, y: 50 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4, duration: 0.5 }}
//                 style={{ 
//                   backgroundColor: 'var(--color-surface)',
//                   borderRadius: '12px',
//                   boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
//                 }}
//               >
//                 <div className="mb-3">
//                   <img 
//                     src="/assets/Icons/bathroom-cabinet.png" 
//                     alt="Bathroom cabinet removal"
//                     width="80" 
//                     height="80" 
//                   />
//                 </div>
//                 <h4 className="fw-bold mb-3">Bathroom Cabinet Removal</h4>
//                 <p>Professional removal of bathroom vanities, medicine cabinets, and storage cabinets while protecting surrounding fixtures.</p>
//               </motion.div>
//             </Col>
//             <Col lg={4} md={6} className="mb-4">
//               <motion.div 
//                 className="text-center p-4 h-100"
//                 initial={{ opacity: 0, y: 50 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.6, duration: 0.5 }}
//                 style={{ 
//                   backgroundColor: 'var(--color-surface)',
//                   borderRadius: '12px',
//                   boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
//                 }}
//               >
//                 <div className="mb-3">
//                   <img 
//                     src="/assets/Icons/custom-cabinet.png" 
//                     alt="Custom cabinet removal"
//                     width="80" 
//                     height="80" 
//                   />
//                 </div>
//                 <h4 className="fw-bold mb-3">Custom Cabinet Removal</h4>
//                 <p>Specialized removal of built-in and custom cabinets, entertainment centers, and storage units throughout your home.</p>
//               </motion.div>
//             </Col>
//           </Row>
//         </Container>
//       </section>

//       {/* Why Choose Us */}
//       <section style={{ 
//         padding: '80px 0',
//         backgroundColor: 'var(--color-surface)'
//       }}>
//         <Container>
//           <Row className="align-items-center">
//             <Col lg={6} md={12} className="mb-5 mb-lg-0">
//               <motion.h2 
//                 className="display-5 fw-bold mb-4"
//                 initial={{ opacity: 0, x: -50 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.6 }}
//                 style={{ color: 'var(--color-primary)' }}
//               >
//                 Why Choose Mr Demo Pro for Cabinet Removal?
//               </motion.h2>
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3, duration: 0.6 }}
//               >
//                 <div className="mb-4">
//                   <h5 className="fw-bold mb-2">✅ Careful Removal</h5>
//                   <p>We take extra care to preserve your walls, flooring, and surrounding fixtures during cabinet removal.</p>
//                 </div>
//                 <div className="mb-4">
//                   <h5 className="fw-bold mb-2">✅ Professional Tools</h5>
//                   <p>Using the right tools and techniques to ensure clean, damage-free removal.</p>
//                 </div>
//                 <div className="mb-4">
//                   <h5 className="fw-bold mb-2">✅ Clean Disposal</h5>
//                   <p>Proper disposal of old cabinets and materials, leaving your space clean and ready.</p>
//                 </div>
//                 <div className="mb-4">
//                   <h5 className="fw-bold mb-2">✅ Licensed & Insured</h5>
//                   <p>Fully licensed and insured for your protection and peace of mind.</p>
//                 </div>
//               </motion.div>
//             </Col>
//             <Col lg={6} md={12}>
//               <motion.img 
//                 src="/assets/img/services/cabinet-removal-process.jpg"
//                 alt="Cabinet removal process"
//                 className="img-fluid rounded"
//                 initial={{ opacity: 0, x: 50 }}
//                 whileInView={{ opacity: 1, x: 0 }}
//                 transition={{ delay: 0.2, duration: 0.6 }}
//                 style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
//               />
//             </Col>
//           </Row>
//         </Container>
//       </section>

//       {/* Service Areas */}
//       <section style={{ padding: '80px 0' }}>
//         <Container>
//           <Row>
//             <Col xs={12} className="text-center mb-5">
//               <motion.h2 
//                 className="display-5 fw-bold mb-4"
//                 initial={{ opacity: 0 }}
//                 whileInView={{ opacity: 1 }}
//                 transition={{ duration: 0.6 }}
//                 style={{ color: 'var(--color-primary)' }}
//               >
//                 Serving Hampton Roads Area
//               </motion.h2>
//               <motion.p 
//                 className="lead"
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.3, duration: 0.6 }}
//               >
//                 We provide cabinet removal services throughout the Hampton Roads region
//               </motion.p>
//             </Col>
//           </Row>
//           <Row className="text-center">
//             <Col md={3} sm={6} className="mb-4">
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.2, duration: 0.5 }}
//               >
//                 <h5 className="fw-bold">Yorktown</h5>
//                 <p>Cabinet removal services</p>
//               </motion.div>
//             </Col>
//             <Col md={3} sm={6} className="mb-4">
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.4, duration: 0.5 }}
//               >
//                 <h5 className="fw-bold">Norfolk</h5>
//                 <p>Cabinet removal services</p>
//               </motion.div>
//             </Col>
//             <Col md={3} sm={6} className="mb-4">
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.6, duration: 0.5 }}
//               >
//                 <h5 className="fw-bold">Newport News</h5>
//                 <p>Cabinet removal services</p>
//               </motion.div>
//             </Col>
//             <Col md={3} sm={6} className="mb-4">
//               <motion.div
//                 initial={{ opacity: 0, y: 30 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ delay: 0.8, duration: 0.5 }}
//               >
//                 <h5 className="fw-bold">Hampton</h5>
//                 <p>Cabinet removal services</p>
//               </motion.div>
//             </Col>
//           </Row>
//         </Container>
//       </section>

//       {/* CTA Section */}
//       <section style={{ 
//         padding: '80px 0',
//         backgroundColor: 'var(--color-primary)',
//         color: 'white'
//       }}>
//         <Container className="text-center">
//           <motion.h2 
//             className="display-5 fw-bold mb-4"
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             transition={{ duration: 0.6 }}
//           >
//             Ready to Remove Your Old Cabinets?
//           </motion.h2>
//           <motion.p 
//             className="lead mb-5"
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3, duration: 0.6 }}
//           >
//             Get your free estimate today! Call us at 757-848-4559 or request a quote online.
//           </motion.p>
//           <motion.div
//             initial={{ opacity: 0 }}
//             whileInView={{ opacity: 1 }}
//             transition={{ delay: 0.6, duration: 0.6 }}
//           >
//             <a 
//               href="tel:757-848-4559" 
//               className="btn btn-light btn-lg me-3 mb-3"
//               style={{ fontWeight: 'bold' }}
//             >
//               📞 Call Now: 757-848-4559
//             </a>
//             <Link to="/contact" className="btn btn-outline-light btn-lg mb-3">
//               Get Free Quote
//             </Link>
//           </motion.div>
//         </Container>
//       </section>
//     </div>
//   );
// };

// export default CabinetRemoval;
