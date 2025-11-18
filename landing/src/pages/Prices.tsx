import React from "react";
import { Container, Table } from "react-bootstrap";

const Prices: React.FC = () => {
  return (
    <section style={{ padding: "80px 0 60px 0" }}>
      <Container>
        <h1 className="text-center" style={{ color: "var(--color-primary)", marginBottom: "30px" }}>Prices</h1>
        <p className="text-center" style={{ marginBottom: "40px", color: "var(--color-text-secondary)" }}>
          Transparent pricing for our most common services. Final pricing depends on access, volume, and disposal weight.
        </p>

        <div style={{ overflowX: "auto" }}>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Category</th>
                <th>Service</th>
                <th>Description</th>
                <th>Unit</th>
                <th>Base Price</th>
                <th>High Price</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Base Services</strong></td>
                <td>Standard Cleanout (1BR / small unit)</td>
                <td>Remove debris, bag trash, basic sweep</td>
                <td>Per Job</td>
                <td>$350</td>
                <td>$550</td>
                <td>Up to ½ ton, easy access</td>
              </tr>
              <tr>
                <td></td>
                <td>2–3 Bedroom Cleanout</td>
                <td>Furniture &amp; debris removal</td>
                <td>Per Job</td>
                <td>$600</td>
                <td>$900</td>
                <td>Includes 1 ton disposal</td>
              </tr>
              <tr>
                <td></td>
                <td>Full House Cleanout (4BR+)</td>
                <td>Whole home, garage, and yard debris</td>
                <td>Per Job</td>
                <td>$950</td>
                <td>$1,500</td>
                <td>1.5–2 tons, extra labor billed hourly</td>
              </tr>
              <tr>
                <td></td>
                <td>Eviction / Emergency Cleanout</td>
                <td>Rapid or same-day response</td>
                <td>Per Job</td>
                <td>$1,200</td>
                <td>$2,000</td>
                <td>+$150 for same-day</td>
              </tr>
              <tr>
                <td></td>
                <td>Commercial / Multi-Unit Cleanout</td>
                <td>Offices or multiple units</td>
                <td>Custom</td>
                <td>-</td>
                <td>-</td>
                <td>Quoted per cubic yard/labor</td>
              </tr>
            </tbody>
          </Table>
        </div>

        <p className="text-center" style={{ marginTop: "20px", color: "var(--color-text-secondary)" }}>
          Need a precise quote? Call <a href="tel:757-848-4559">757-848-4559</a> or request a free estimate.
        </p>
      </Container>
    </section>
  );
};

export default Prices;


