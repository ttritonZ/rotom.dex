import React from 'react';
import './Loading.css'; // CSS for animation

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <img
        src={`http://localhost:5173/src/assets/common/loading.png`}
        alt=""
        className="pokeball-spin w-16 h-16"
      />
    </div>
  );
};

export default Loading;
