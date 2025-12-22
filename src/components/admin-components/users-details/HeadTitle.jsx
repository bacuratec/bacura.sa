import React from "react";

const HeadTitle = ({
  title,
  nav1,
  nav2,
  type,
  status,
  typeProject,
  statusProject,
}) => {
  const requestStatusStyles = {
    500: {
      bg: "#FFF2EE",
      border: "#FFCDBD",
      text: "#B82E00",
    },
    501: {
      bg: "#EEFBF4",
      border: "#B2EECC",
      text: "#17663AB2",
    },
    502: {
      bg: "#F7F7F8",
      border: "#D1D1DB",
      text: "#066F1D",
    },
    503: {
      bg: "#FEF0F4",
      border: "#FBB1C4",
      text: "#D50B3E",
    },
    504: {
      bg: "#FFF9EB",
      border: "#FFDA85",
      text: "#C78F0B",
    },
    505: {
      bg: "#EEFBF4",
      border: "#B2EECC",
      text: "#17663AB2",
    },
  };
  const requestCurrentStyle = requestStatusStyles[status];

  const projectStatusStyles = {
    600: {
      bg: "#FFF9EB",
      border: "#FFDA85",
      text: "#8A6100",
    },
    601: {
      bg: "#F7F7F8",
      border: "#D1D1DB",
      text: "#3F3F50",
    },
    602: {
      bg: "#FFF2EE",
      border: "#FFCDBD",
      text: "#B82E00",
    },
    603: {
      bg: "#EEFBF4",
      border: "#B2EECC",
      text: "#17663AB2",
    },
    604: {
      bg: "#FEF0F4",
      border: "#FBB1C4",
      text: "#D50B3E",
    },
    605: { bg: "#FFF9EB", border: "#FFDA85", text: "#C78F0B" },
    606: {
      bg: "#EEFBF4",
      border: "#B2EECC",
      text: "#17663AB2",
    },
  };
  const projectCurrentStyle = projectStatusStyles[statusProject];

  return (
    <div className="flex items-center justify-between lg:w-1/2">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-2xl">{title}</h1>
        <div>
          <span className="text-[#898A8D] text-xs">{nav1}</span> &gt;{" "}
          <span className="text-primary text-xs">{nav2}</span>
        </div>
      </div>
      {requestCurrentStyle && (
        <div
          className="rounded-lg text-sm py-1 px-2"
          style={{
            backgroundColor: requestCurrentStyle.bg,
            border: `1px solid ${requestCurrentStyle.border}`,
            color: requestCurrentStyle.text,
          }}
        >
          {type}
        </div>
      )}
      {projectCurrentStyle && (
        <div
          className="rounded-lg text-sm py-1 px-2"
          style={{
            backgroundColor: projectCurrentStyle.bg,
            border: `1px solid ${projectCurrentStyle.border}`,
            color: projectCurrentStyle.text,
          }}
        >
          {typeProject}
        </div>
      )}
    </div>
  );
};

export default HeadTitle;
