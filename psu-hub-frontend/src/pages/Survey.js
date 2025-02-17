// psu-hub-frontend/src/pages/Survey.js
import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Survey = () => {
  const [responses, setResponses] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const eventId = queryParams.get('eventId');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:3001/api/surveys/submit', {
        eventId,
        responses
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setMessage(res.data.message);
      toast.success(res.data.message);
      // Navigate to the Certificate page and pass certificate data
      navigate('/certificate', { state: { certificate: res.data.certificate } });
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message;
      setMessage('Error submitting survey: ' + errMsg);
      toast.error('Error submitting survey: ' + errMsg);
    }
  };

  return (
    <div>
      <h1>Survey for Event {eventId}</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Rate the event (1-5):{' '}
          <input
            type="number"
            min="1"
            max="5"
            onChange={(e) =>
              setResponses({ ...responses, rating: e.target.value })
            }
          />
        </label>
        <br />
        <button type="submit">Submit Survey</button>
      </form>
    </div>
  );
};

export default Survey;
