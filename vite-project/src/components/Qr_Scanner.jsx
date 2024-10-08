import { Html5QrcodeScanner } from "html5-qrcode";
import { useState, useEffect } from "react";

const Qr_Scanner = () => {
  const [scanning, setScanning] = useState(false); // To control scanner visibility
  const [scanResult, setScanResult] = useState({});

  const startScanning = () => {
    setScanning(true); // Start scanning
  };

  useEffect(() => {
    let scanner = null;

    if (scanning) {
      // Ensure a delay to let the DOM element be rendered
      setTimeout(() => {
        const element = document.getElementById("reader");

        if (element) {
          scanner = new Html5QrcodeScanner("reader", {
            qrbox: {
              width: 250,
              height: 250,
            },
            fps: 5,
          });

          const onScanSuccess = (result) => {
            scanner.clear(); // Clear the scanner after a successful scan

            // Extract truck number from the scanned result
            const [truckNumber, item] = result.split(":"); // Assuming format is "TRUCK001:item1"

            // Update the state to group items under each truck
            setScanResult(prevResults => ({
              ...prevResults,
              [truckNumber]: [...(prevResults[truckNumber] || []), item]
            }));

            // Reset scanning state to show the dialog box again
            setScanning(false);
          };

          const onScanError = (error) => {
            console.warn("Scan error:", error);
          };

          scanner.render(onScanSuccess, onScanError);
        } else {
          console.error("HTML Element with id=reader not found");
        }
      }, 100); // 100ms delay, adjust as needed
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((error) => {
          console.error("Error clearing scanner: ", error);
        });
      }
    };
  }, [scanning]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-6">Inventory Management of Truck</h1>

      <div className="flex justify-center">
        {/* Start Scanning Button */}
        <button 
          onClick={startScanning}
          className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300"
        >
          Add Product to Truck
        </button>
      </div>

      {/* QR Code Scanner */}
      {scanning && (
        <div className="flex justify-center mt-8">
          <div id="reader" className="border border-gray-400 p-4 rounded-lg shadow-lg"></div>
        </div>
      )}

      {/* Display Results */}
      <div className="mt-12 space-y-8">
        {Object.keys(scanResult).map(truckNumber => (
          <div key={truckNumber} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">{truckNumber} Items:</h2>
            <ul className="list-disc list-inside space-y-2">
              {scanResult[truckNumber].map((item, index) => (
                <li key={index} className="text-gray-600">{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Qr_Scanner;
