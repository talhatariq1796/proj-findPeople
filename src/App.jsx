import React from "react";
import SmartSearchFormWithSubmit from "./components/SmartSearchFormWithSubmit";

const App = () => {
  return (
    <div className="h-screen bg-slate-100 p-4 w-full">
      <div className="flex flex-col space-y-3 items-start justify-start w-full h-full">
<h1 className="text-2xl font-semibold capitalize">Find People</h1>
      <SmartSearchFormWithSubmit />
      </div>
      {/* <div className="w-full mx-auto bg-gradient-to-br from-slate-50 to-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-2 mt-5">
      Table here

      </div> */}

    </div>
  );
};

export default App;
