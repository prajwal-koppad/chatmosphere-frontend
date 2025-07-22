import React from "react";

const AboutPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="dark:bg-gray-900 shadow-2xl rounded-2xl p-10 max-w-xl text-center">
        <h1 className="text-4xl font-bold mb-4">
          About This Project
        </h1>
        <p className="text-lg mb-6">
          This project was built to brush up skills, explore WebSocket
          integration, and practice Full Stack Development.
        </p>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">
            Prajwal Koppad
          </h2>
          <p className="">Software Developer</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
