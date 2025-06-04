import React, { useEffect, useState } from "react";
import axios from "axios";
import Papa from "papaparse";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Use environment-aware API URL
const API_BASE_URL = import.meta.env.PROD
  ? "" // Empty string means use relative URLs in production
  : "http://localhost:5000";

const Admin = () => {
  const [csvUrl, setCsvUrl] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCsv = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch CSV for table display
      const csvRes = await axios.get(`${API_BASE_URL}/admin/csv-raw`, {
        responseType: "text",
        headers: {
          Accept: "text/csv",
        },
      });

      if (!csvRes.data) {
        throw new Error("No data received from server");
      }

      const text = csvRes.data;

      // For download, fetch the file as blob
      const downloadRes = await axios.get(`${API_BASE_URL}/admin/export-csv`, {
        responseType: "blob",
        headers: {
          Accept: "text/csv",
        },
      });

      const url = window.URL.createObjectURL(new Blob([downloadRes.data]));
      setCsvUrl(url);

      // Parse CSV for table display using papaparse
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length > 0) {
        console.warn("CSV parsing errors:", parsed.errors);
        toast.warning("Some CSV entries could not be parsed correctly");
      }

      setMembers(parsed.data.filter((row) => Object.values(row).some(Boolean)));
    } catch (err) {
      console.error("CSV fetch error:", err);
      const errorMessage = err.response
        ? `Server error: ${err.response.status} ${err.response.statusText}`
        : err.message || "Failed to fetch CSV data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCsv();
  }, []);

  return (
    <section className="py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-800">Admin Dashboard</h1>
          <div className="space-x-4">
            <button
              onClick={fetchCsv}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "🔄 Refresh"}
            </button>
            {members.length > 0 && (
              <a
                href={csvUrl}
                download="members.csv"
                className="inline-block px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📥 Download CSV
              </a>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-800"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button
              onClick={fetchCsv}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No member data available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  {Object.keys(members[0]).map((header) => (
                    <th
                      key={header}
                      className="border px-4 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    {Object.entries(member).map(([key, value]) => (
                      <td
                        key={key}
                        className="border px-4 py-2 text-sm whitespace-normal"
                      >
                        {key === "letterUrl" && value ? (
                          <a
                            href={value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
                          >
                            <span>📄</span>
                            <span>View PDF</span>
                          </a>
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default Admin;
