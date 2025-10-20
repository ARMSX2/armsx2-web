import React, { useState } from "react";
import blog from "../data/blog.json";
import { FaTriangleExclamation } from "react-icons/fa6";

const Updates = () => {
  const [expandedUpdate, setExpandedUpdate] = useState(null);

  return (
    <div className="relative mx-auto max-w-7xl px-6 min-h-screen flex flex-col justify-center snap-start py-24 md:py-0" id="updates">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b" />
      <div className="relative w-full space-y-6">
        <h2 className="text-2xl font-semibold text-white">Latest Updates</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blog.updates.map((update, index) => (
            <div
              key={index}
              className={`grid-item p-6 rounded-xl bg-white/5 backdrop-blur-sm ring-1 ring-white/10 hover:ring-[#8d76cc]/30 cursor-pointer group min-h-[180px] flex flex-col ${
                expandedUpdate === index ? "expanded" : ""
              }`}
              onClick={() => setExpandedUpdate(expandedUpdate === index ? null : index)}
            >
              <h3 className="text-lg font-semibold text-white group-hover:text-[#8d76cc] transition-colors flex items-center gap-2">
                {update.title}
                {update.extraicon === "warning" && (
                  <FaTriangleExclamation className="text-yellow-400 text-sm" />
                )}
              </h3>
              <p className="mt-2 text-white/70">{update.content}</p>

              <div className={`expanded-content transition-all duration-300 overflow-hidden ${expandedUpdate === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                {(update.extended_content || update.extended_content_img) && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    {update.extended_content && (
                      <p className="text-white/70 mb-4 transition-opacity duration-300">{update.extended_content}</p>
                    )}
                    {update.extended_content_img && (
                      <div className="mt-2 transition-opacity duration-300 w-full flex flex-col items-center">
                        <div className="w-full max-w-[600px] min-h-[200px] max-h-[300px] rounded-2xl overflow-hidden shadow-lg bg-white/5 flex items-center justify-center">
                          <img
                            src={update.extended_content_img}
                            alt="Update thumbnail"
                            className="w-full h-auto max-h-[300px] object-contain"
                          />
                        </div>
                        <a
                          href={update.extended_content_img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hidden md:block mt-2 text-sm text-white/60 hover:text-white/90 transition-colors underline underline-offset-2"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          {(() => {
                            try {
                              return (
                                "Media from " + new URL(update.extended_content_img).hostname.replace(/^www\./, "")
                              );
                            } catch {
                              return "View source";
                            }
                          })()}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center text-xs text-white/50">
                  <span>{update.date}</span>
                  <span className="mx-2">•</span>
                  <span>by {update.author}</span>
                </div>
                <div className="text-white/50">
                  <svg
                    className={`w-5 h-5 transition-transform duration-500 ${expandedUpdate === index ? "rotate-180" : ""}`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Updates;
