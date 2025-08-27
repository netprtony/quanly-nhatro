import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

// Hỗ trợ lấy giá trị lồng như "room_type.type_name"
const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, part) => acc && acc[part], obj);

export default function Table({
  columns,
  data,
  page = 1,
  pageSize = 10,
  totalRecords = 0,
  onPageChange,
  onPageSizeChange,
}) {
  const [expandedRow, setExpandedRow] = useState(null);

  const handleToggleRow = (rowIndex) => {
    setExpandedRow(expandedRow === rowIndex ? null : rowIndex);
  };

  return (
    <div className="overflow-x-auto border rounded-lg shadow-md">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-2 border text-left font-semibold">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-500"
              >
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const isExpanded = expandedRow === rowIndex;
              return (
                <React.Fragment key={rowIndex}>
                  <tr
                    className={`border-b hover:bg-gray-50 cursor-pointer ${
                      isExpanded ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handleToggleRow(rowIndex)}
                  >
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-4 py-2 border">
                        {colIndex === 0 ? (
                          <div className="flex items-center gap-2">
                            <span>{rowIndex + 1 + (page - 1) * pageSize}</span>
                            {isExpanded ? (
                              <FaChevronUp className="text-gray-600" />
                            ) : (
                              <FaChevronDown className="text-gray-600" />
                            )}
                          </div>
                        ) : (
                          getNestedValue(row, col.accessor)
                        )}
                      </td>
                    ))}
                  </tr>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50"
                      >
                        <td
                          colSpan={columns.length}
                          className="px-4 py-3 border text-sm text-gray-700"
                        >
                          <strong>Chi tiết:</strong>{" "}
                          {JSON.stringify(row, null, 2)}
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
