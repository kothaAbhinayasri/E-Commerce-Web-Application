// import { useState } from 'react'
// import { useDispatch } from 'react-redux'
// import { login } from '../store/slices/authSlice.js'
// import { useNavigate } from 'react-router-dom'

// export default function Login(){
//   const [email,setEmail]=useState('')
//   const [password,setPassword]=useState('')
//   const [error,setError]=useState('')
//   const dispatch = useDispatch()
//   const navigate = useNavigate()
//   const onSubmit = async e => {
//     e.preventDefault()
//     try{
//       await dispatch(login({email,password})).unwrap()
//       navigate('/')
//     }catch(e){ setError('Invalid credentials') }
//   }
//   return (
//     <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3">
//       <h2 className="text-xl font-semibold">Login</h2>
//       {error && <div className="text-red-600 text-sm">{error}</div>}
//       <input className="border p-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
//       <input className="border p-2 w-full" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
//       <button className="bg-black text-white px-4 py-2">Login</button>
//     </form>
//   )
// }

/*
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser({ email, password })).unwrap();
      navigate("/");
    } catch (e) {
      setError("Invalid credentials");
    }
  };

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3 p-4">
      <h2 className="text-xl font-bold">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="border p-2 w-full"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">
        Login
      </button>
    </form>
  );
}
*/

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, setUserFromToken } from "../store/slices/authSlice";
import { useNavigate, useSearchParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { error } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      dispatch(setUserFromToken(token));
      navigate('/');
    }
  }, [searchParams, dispatch, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));
    if (result.meta.requestStatus === "fulfilled") {
      navigate("/"); // redirect after login
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API}/auth/google`;
  };

  return (
    <div className="max-w-sm mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
      <div className="mt-4">
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}

