import { useState } from 'react';
import Modal from './Modal';

import styles from './DesignStormsButton.module.css';

function DesignStormsButton() {
  const [showModal, setShowModal] = useState<boolean>(false);
  return (
    <>
      <div className={styles.Button} onClick={() => setShowModal(true)}>
        Design storms
      </div>
      {showModal ? (
        <Modal title="Design storms" close={() => setShowModal(false)}>
          <div className={styles.Container}>
            <p>Rain events (mm)</p>
            <table className={styles.StormsTable} cellPadding="5" cellSpacing="0">
              <thead>
                <tr>
                  <th>Duration</th><th>20%</th><th>10%</th><th>5%</th><th>2%</th><th>1%</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1 hour</td><td>35.8</td><td>41.4</td><td>47</td><td>54.6</td><td>60.6</td>
                </tr>
                <tr>
                  <td>3 hours</td><td>51.3</td><td>59.5</td><td>67.9</td><td>79.8</td><td>89.4</td>
                </tr>
                <tr>
                  <td>6 hours</td><td>58.3</td><td>80.3</td><td>92.7</td><td>110</td><td>124</td>
                </tr>
                <tr>
                  <td>12 hours</td><td>95</td><td>114</td><td>134</td><td>160</td><td>182</td>
                </tr>
              </tbody>
            </table>
            <p>Bureau of Meteorology ARR2016 design rainfall values taken in a central Parramatta catchment. Each catchment has a slightly different set of values. For more accuracy, please visit <a href="http://www.bom.gov.au/water/designRainfalls/revised-ifd/" target="_blank" title="Link to http://www.bom.gov.au/water/designRainfalls/revised-ifd/" rel="noreferrer">http://www.bom.gov.au/water/designRainfalls/revised-ifd/</a>.</p>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

export default DesignStormsButton;
