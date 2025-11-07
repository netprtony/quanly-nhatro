import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// --- CSS GỘP TRỰC TIẾP ---
const style = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
.attendance-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 600px;
  height: 1024px;
  background: linear-gradient(135deg, #7C449C 0%, #7CC444 100%);
  background-image: url('https://www.transparenttextures.com/patterns/asfalt-light.png');
  background-blend-mode: overlay;
  font-family: 'Roboto', Arial, sans-serif;
  transform: rotate(0deg);
  transform-origin: center;
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -300px;
  margin-top: -512px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  overflow: hidden;
}
.camera-section {
  position: relative;
  width: 100%;
  height: 800px;
  margin: 0;
  background: #fff;
  border-bottom: 2px solid #7C449C;
}
.camera-feed {
  width: 100%;
  height: 100%;
  border-radius: 15px 15px 0 0;
  object-fit: cover;
  transform: scaleX(-1);
}
.recognition-frame {
  position: absolute;
  top: 5%;
  left: 5%;
  width: 90%;
  height: 90%;
  border: 4px solid #7C449C;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(124, 68, 156, 0.4);
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.recognition-frame.success {
  border-color: #7CC444;
  box-shadow: 0 0 15px rgba(124, 196, 68, 0.5);
}
.recognition-frame.fail {
  border-color: #f5222d;
  box-shadow: 0 0 15px rgba(245, 34, 45, 0.5);
}
.recognition-frame.recognizing {
  border-color: #7C449C;
  box-shadow: 0 0 20px rgba(124, 68, 156, 0.6);
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 12px rgba(124, 68, 156, 0.4); }
  50% { box-shadow: 0 0 20px rgba(124, 68, 156, 0.6); }
  100% { box-shadow: 0 0 12px rgba(124, 68, 156, 0.4); }
}
.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 50px;
  height: 50px;
  border: 5px solid #7CC444;
  border-top: 5px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  transform: translate(-50%, -50%);
}
.spinner.small {
  width: 24px;
  height: 24px;
  border: 4px solid #fff;
  border-top: 4px solid transparent;
}
@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}
.status-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background-color: #7C449C;
}
.status-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.status-message p {
  font-size: 25px;
  font-weight: 500;
  color: #fff;
  margin: 0;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}
.icon {
  font-size: 24px;
}
.support-buttons {
  display: flex;
  flex-direction: row;
  gap: 20px;
  width: 90%;
  padding: 6px;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
}
button {
  padding: 12px 24px;
  font-size: 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  touch-action: manipulation;
}
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.login-btn {
  background-color: #7C449C;
  color: #fff;
  width: 100%;
  font-weight: 500;
}
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 600px;
  height: 1024px;
  background: rgba(124, 68, 156, 0.7);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  transform-origin: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 25px;
  border-radius: 16px;
  width: 85%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.form-group {
  margin-bottom: 20px;
  text-align: left;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 18px;
  color: #7C449C;
}
.form-group input {
  width: 100%;
  padding: 12px;
  border: 2px solid #7C449C;
  border-radius: 12px;
  font-size: 2.2rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
}
.form-group input:focus {
  border-color: #7CC444;
  outline: none;
  box-shadow: 0 0 6px rgba(124, 196, 68, 0.4);
}
.form-group input.highlight {
  background-color: #ffe6e6;
  border-color: #f5222d;
  animation: shake 0.3s ease;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
.error-message {
  color: #f5222d;
  font-size: 16px;
  margin-top: 8px;
  text-align: left;
  font-weight: 500;
}
.modal-content button {
  width: 100%;
  margin-top: 15px;
  padding: 12px;
  font-size: 2.2rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.submit-btn {
  background-color: #7CC444;
  color: #fff;
  font-weight: 500;
}
.numeric-keyboard {
  background: linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%);
  padding: 20px;
  border-top: 2px solid #7C449C;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 -3px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.keyboard-row {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
  width: 100%;
  max-width: 300px;
}
.key-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.keyboard-key {
  font-size: 1.8rem;
  padding: 12px;
  background: #7C449C;
  border: 2px solid #5e3475;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #fff;
  font-weight: 500;
  min-width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}
.keyboard-key:hover {
  background: #7CC444;
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
}
.keyboard-key:active {
  background: #5e3475;
  transform: scale(0.95);
  box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.15);
}
.special-key {
  background: #f5222d;
  color: #fff;
  font-size: 1.8rem;
  min-width: 80px;
  height: 80px;
  padding: 12px;
  border: 2px solid #d32f2f;
}
.special-key.enter {
  background: #7C449C;
  border: 2px solid #5e3475;
}
.key-label {
  font-size: 14px;
  color: #7C449C;
  margin-top: 6px;
}
.employee-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
  border: 3px solid #7CC444;
}
.status-message {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.close-btn {
  position: relative;
  background: #7C449C;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #fff;
  transition: transform 0.2s ease, background-color 0.2s ease;
  touch-action: manipulation;
  padding: 10px;
  border-radius: 8px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (hover: hover) and (pointer: fine) {
  .close-btn:hover {
    background-color: #7CC444;
    transform: scale(1.1);
  }
}
.close-btn:active {
  transform: scale(0.95);
  background-color: #5e3475;
}
@media (max-width: 599px) {
  .attendance-container {
    width: 100%;
    height: 100vh;
    margin: 0;
    top: 0;
    left: 0;
    border-radius: 0;
  }
  .camera-section {
    height: 80vh;
  }
  .support-buttons {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }
  .login-btn {
    width: 100%;
  }
  .login-modal {
    width: 100%;
    height: 100vh;
  }
  .modal-content {
    width: 90%;
    max-width: none;
    padding: 20px;
  }
  .keyboard-row {
    gap: 8px;
    max-width: 100%;
  }
  .keyboard-key {
    min-width: 60px;
    height: 60px;
    padding: 8px;
    font-size: 1.5rem;
  }
  .special-key {
    min-width: 60px;
    height: 60px;
    padding: 8px;
  }
  .status-message p {
    font-size: 24px;
  }
  .employee-avatar {
    width: 80px;
    height: 80px;
  }
}
`;

const AttendanceScreen = () => {
  const [recognitionStatus, setRecognitionStatus] = useState({
    message: 'Vui lòng nhìn vào camera để điểm danh',
    user: '',
    timestamp: '',
    method: '',
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [frameClass, setFrameClass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [highlight, setHighlight] = useState(false);
  const videoRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Inject style only once
    if (!document.getElementById('attendance-style')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'attendance-style';
      styleTag.innerHTML = style;
      document.head.appendChild(styleTag);
    }
  }, []);

  useEffect(() => {
    if (isLoginModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoginModalOpen]);

  useEffect(() => {
    let stream;
    const startCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setRecognitionStatus({
          message: 'Trình duyệt không hỗ trợ truy cập camera.',
          user: '',
          timestamp: '',
          method: '',
        });
        return;
      }
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideoInput = devices.some((device) => device.kind === 'videoinput');
        if (!hasVideoInput) {
          throw new Error('Không tìm thấy thiết bị camera.');
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        setRecognitionStatus({
          message:
            error.name === 'NotAllowedError'
              ? 'Bạn đã từ chối quyền truy cập camera.'
              : error.message || 'Không thể truy cập camera.',
          user: '',
          timestamp: '',
          method: '',
        });
      }
    };
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureImageFromVideo = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
  };

  const formatTimestamp = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${pad(date.getFullYear())}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const resetRecognitionStatus = () => {
    setRecognitionStatus({
      message: 'Vui lòng nhìn vào camera để điểm danh',
      user: '',
      timestamp: '',
      method: '',
    });
  };

  // Chỉ nhận diện khi bấm nút
  const handleFaceRecognition = async () => {
    if (isRecognizing) return;
    setIsRecognizing(true);
    setFrameClass('recognizing recognition-frame');
    setRecognitionStatus({
      message: 'Đang nhận diện khuôn mặt...',
      user: '',
      timestamp: '',
      method: '',
    });
    try {
      const imageBase64 = captureImageFromVideo();
      if (!imageBase64) {
        throw new Error('Không lấy được ảnh từ camera');
      }
      const formData = new FormData();
      // API backend nhận file dạng UploadFile, nên cần convert lại từ base64 sang file blob
      const byteString = atob(imageBase64);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/jpeg' });
      formData.append('file', blob, 'face.jpg');
      // Gửi lên API mới
      const response = await axios.post('/tenants/recognize-tenant', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000
      });
      if (response.status === 200) {
        if (response.data.tenant_id) {
          setRecognitionStatus({
            message: 'Nhận diện thành công!',
            user: response.data.tenant_id,
            timestamp: formatTimestamp(new Date()),
            method: 'face',
          });
          setFrameClass('success recognition-frame');
          setTimeout(() => {
            setFrameClass('recognition-frame');
            resetRecognitionStatus();
          }, 1500);
        } else {
          setRecognitionStatus({
            message: 'Không nhận dạng được khách thuê',
            user: '',
            timestamp: '',
            method: '',
          });
          setFrameClass('fail recognition-frame');
          setTimeout(() => setFrameClass('recognition-frame'), 1500);
        }
      } else {
        throw new Error(response.data.error || 'Lỗi server không xác định');
      }
    } catch (error) {
      let errorMsg = 'Không nhận diện được, vui lòng thử lại';
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Hết thời gian kết nối, vui lòng kiểm tra mạng';
      } else if (error.response?.data?.detail) {
        errorMsg = error.response.data.detail;
      }
      setRecognitionStatus({
        message: errorMsg,
        user: '',
        timestamp: '',
        method: '',
      });
      setFrameClass('fail recognition-frame');
      setTimeout(() => setFrameClass('recognition-frame'), 1500);
    }
    setIsRecognizing(false);
  };

  const handleKeyPress = (key) => {
    if (key === 'Enter') {
      inputRef.current.form.dispatchEvent(new Event('submit', { cancelable: true }));
    } else if (key === 'Backspace') {
      setEmployeeCode((prev) => prev.slice(0, -1));
    } else if (key === 'Clear') {
      setEmployeeCode('');
      setErrorMessage('');
    } else {
      setEmployeeCode((prev) => prev + key);
      if (!/^\d*$/.test(employeeCode + key)) {
        setErrorMessage('Mã nhân viên chỉ được chứa số');
        setHighlight(true);
        setTimeout(() => setHighlight(false), 500);
      } else {
        setErrorMessage('');
      }
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    if (!employeeCode) {
      setErrorMessage('Không được để trống mã nhân viên');
      setHighlight(true);
      setTimeout(() => setHighlight(false), 500);
      setIsSubmitting(false);
      return;
    }
    if (!/^\d+$/.test(employeeCode)) {
      setErrorMessage('Mã nhân viên chỉ được chứa số');
      setHighlight(true);
      setTimeout(() => setHighlight(false), 500);
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await axios.post('/api/v1/attendances/record', {
        employee_id: employeeCode,
        method: 'manual',
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.status === 200) {
        if (response.data.message === 'Attendance already recorded for today') {
          setRecognitionStatus({
            message: 'Bạn đã điểm danh hôm nay!',
            user: employeeCode,
            timestamp: formatTimestamp(new Date()),
            method: response.data.record?.method || 'manual',
          });
          setTimeout(() => resetRecognitionStatus(), 1500);
        } else {
          const employeeResponse = await axios.get(`/employees/${employeeCode}`);
          setRecognitionStatus({
            message: 'Điểm danh thành công!',
            user: employeeResponse.data.name || employeeCode,
            timestamp: formatTimestamp(new Date()),
            method: response.data.record?.method || 'manual',
          });
          setTimeout(() => resetRecognitionStatus(), 1500);
        }
        setIsLoginModalOpen(false);
        setEmployeeCode('');
      } else {
        setErrorMessage(response.data.error || 'Lỗi không xác định');
        setHighlight(true);
        setTimeout(() => setHighlight(false), 500);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Lỗi kết nối server';
      setErrorMessage(errorMsg);
      setHighlight(true);
      setTimeout(() => setHighlight(false), 500);
    }
    setIsSubmitting(false);
  };

  const handleCloseModal = (e) => {
    if (e.target.className?.includes('login-modal')) {
      setIsLoginModalOpen(false);
      setEmployeeCode('');
      setErrorMessage('');
    }
  };

  const NumericKeyboard = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['Backspace', '0', 'Clear'],
      ['Enter']
    ];
    return (
      <div className="numeric-keyboard">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => (
              <div key={key} className="key-wrapper">
                <button
                  type="button"
                  className={
                    `keyboard-key` +
                    (key === 'Backspace' || key === 'Clear' ? ' special-key' : '') +
                    (key === 'Enter' ? ' special-key enter' : '')
                  }
                  onClick={() => handleKeyPress(key)}
                >
                  {key === 'Backspace' ? '⌫' : key === 'Enter' ? '➜' : key === 'Clear' ? '🗑️' : key}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="attendance-container">
      <div className="camera-section">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="camera-feed"
        />
        <div className={`recognition-frame ${frameClass}`}></div>
        {isRecognizing && (
          <div className="spinner" />
        )}
      </div>
      <div className="status-section">
        <div className="status-message">
          <p>
            {(recognitionStatus.message === 'Điểm danh thành công!' || recognitionStatus.message === 'Bạn đã điểm danh hôm nay!') && (
              <span className="icon">✔️</span>
            )}
            {recognitionStatus.message}
          </p>
          {recognitionStatus.user && (
            <p>
              <span className="icon">👋</span>
              Chào {recognitionStatus.user}
            </p>
          )}
          {recognitionStatus.timestamp && (
            <p>
              <span className="icon">⏰</span>
              {recognitionStatus.timestamp}
            </p>
          )}
          {recognitionStatus.method && (
            <p>
              <span className="icon">{recognitionStatus.method === 'face' ? '😊' : '🔢'}</span>
              Phương thức: {recognitionStatus.method === 'face' ? 'Nhận diện khuôn mặt' : 'Nhập mã nhân viên'}
            </p>
          )}
        </div>
      </div>
      <div className="support-buttons">
        <button
          className="login-btn"
          onClick={() => setIsLoginModalOpen(true)}
        >
          ✍ Nhập mã thay thế
        </button>
        <button
          className="login-btn"
          style={{ backgroundColor: '#7CC444', color: '#fff' }}
          onClick={handleFaceRecognition}
          disabled={isRecognizing}
        >
          {isRecognizing ? 'Đang nhận diện...' : '😊 Nhận diện khuôn mặt'}
        </button>
      </div>

      {isLoginModalOpen && (
        <div
          className="login-modal"
          tabIndex="-1"
          onClick={handleCloseModal}
        >
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsLoginModalOpen(false)}>✖</button>
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label>Mã nhân viên:</label>
                <input
                  type="text"
                  value={employeeCode}
                  onChange={(e) => {
                    setEmployeeCode(e.target.value);
                    if (!/^\d*$/.test(e.target.value)) {
                      setErrorMessage('Mã nhân viên chỉ được chứa số');
                      setHighlight(true);
                      setTimeout(() => setHighlight(false), 500);
                    } else {
                      setErrorMessage('');
                    }
                  }}
                  required
                  ref={inputRef}
                  className={highlight ? 'highlight' : ''}
                  style={{ fontSize: '2.2rem' }}
                />
                {errorMessage && <div className="error-message">{errorMessage}</div>}
              </div>
              <NumericKeyboard />
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? <span className="spinner small"></span> : 'Đăng nhập'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceScreen;