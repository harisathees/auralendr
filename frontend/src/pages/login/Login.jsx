import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Keep calling the existing login function. If it expects an email,
      // the employee ID will be passed here — adjust if needed.
      await login(employeeId, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display group/design-root overflow-x-hidden bg-primary dark:bg-primary" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
      {/* Top Section */}
      <div className="absolute top-0 left-0 w-full h-[30%] bg-primary dark:bg-primary flex items-center justify-center p-8">
        <div className="w-16 h-16 bg-center bg-no-repeat bg-contain" data-alt="Company Logo showing abstract geometric shapes" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAtQsnHv79QMEZQ5UI6qpcomHGRs5b7Tm5092Ltfb3Y0hAyp2msudO9hIpKjvBmA3lrXdeOd7rFUh_h1z4fF4y3c5ZmA0ZTsntuQQ8olIRq15HgZkqdAhV-9DfsutHRZNq5kkfOqpMqJ5FRX3SXmIdJAGvWQWHrkLAV77NuOtKz7NsyBh6o6sjjiuWT9Spoi9l271hiMGvbQnTw2un3D2Hu-dQixuG2cbiFx6Tvn4jNwvgqCzxwtjRVzGMmpOK72GTY14uFjcea0LQ4")' }} />
      </div>

      {/* Bottom Card Section */}
      <div className="absolute bottom-0 left-0 w-full h-[70%] bg-white dark:bg-background-dark rounded-t-2xl shadow-lg flex flex-col justify-between p-6">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-[#111418] dark:text-white tracking-light text-[32px] font-bold leading-tight text-center pb-6">Secure Login</h1>
          <form onSubmit={submit} className="flex flex-col gap-4">
            {/* Employee ID Field */}
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col w-full flex-1">
                <p className="text-[#111418] dark:text-gray-300 text-base font-medium leading-normal pb-2">Employee ID</p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-0 border border-[#CCCCCC] dark:border-gray-600 bg-white dark:bg-background-dark focus:border-primary h-14 placeholder:text-[#617589] dark:placeholder:text-gray-500 p-[15px] text-base font-normal leading-normal"
                  placeholder="Enter your employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              </label>
            </div>

            {/* Password Field */}
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex flex-col w-full flex-1">
                <p className="text-[#111418] dark:text-gray-300 text-base font-medium leading-normal pb-2">Password</p>
                <div className="flex w-full flex-1 items-stretch rounded-lg">
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-[#111418] dark:text-white focus:outline-0 focus:ring-0 border border-[#CCCCCC] dark:border-gray-600 bg-white dark:bg-background-dark focus:border-primary h-14 placeholder:text-[#617589] dark:placeholder:text-gray-500 p-[15px] border-r-0 pr-2 text-base font-normal leading-normal"
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <div
                    className="text-[#617589] dark:text-gray-400 flex border border-[#CCCCCC] dark:border-gray-600 bg-white dark:bg-background-dark items-center justify-center pr-[15px] rounded-r-lg border-l-0 cursor-pointer"
                    onClick={() => setShowPassword((s) => !s)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPassword((s) => !s); }}
                  >
                    <span className="material-symbols-outlined" aria-hidden>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </div>
                </div>
              </label>
            </div>

            {/* Error */}
            {error && <p className="text-red-600">{error}</p>}

            {/* Secure Login Button */}
            <div className="flex pt-6">
              <button className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em]" type="submit">
                <span className="truncate">Secure Login</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
