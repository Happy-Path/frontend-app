
import React from 'react';

const Welcome = () => {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-happy-700">
        Welcome to <span className="text-happy-600">Happy</span>
        <span className="text-sunny-500">Path</span>!
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        A special learning journey designed just for you!
      </p>
    </div>
  );
};

export default Welcome;
