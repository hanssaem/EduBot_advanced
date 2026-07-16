import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { useLocation, useNavigate } from 'react-router-dom';
import { SiProbot } from 'react-icons/si';
import { apiUrl } from '../api';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const handleGoogleSign = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const destination = location.state?.from || '/';
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(); // ✅ Firebase에서 ID 토큰 가져오기

      console.log('✅ Firebase 로그인 성공:', result.user.email);

      // ✅ 백엔드로 ID 토큰 전송
      const response = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      console.log('✅ 백엔드 응답:', data);
      navigate(destination);
    } catch (err) {
      console.error('❌ 로그인 실패:', err);
      alert('로그인에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <button
        className="font-bold text-3xl flex pl-2 mb-2"
        onClick={() => navigate('/')}
      >
        EduBot
        <SiProbot className="ml-2 text-3xl" />
      </button>
      <p className="text-gray-600 mb-6">
        학습을 더 효율적으로 만드는 AI 도우미
      </p>
      <div className="p-8 rounded-md border border-gray-200 flex flex-col w-96 text-center items-center gap-6">
        <h1 className="font-pretendard text-2xl font-semibold text-left">
          소셜 계정으로 로그인 하여
          <br />
          Edubot 서비스를 이용해보세요
        </h1>

        <div className="border-t border-gray-600 border-dashed w-full"></div>

        <p className="text-gray-600 text-sm">간편 로그인</p>

        <button
          className="btn bg-white text-black border-[#e5e5e5] w-full"
          onClick={handleGoogleSign}
        >
          <svg
            aria-label="Google logo"
            width="16"
            height="16"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
          >
            <g>
              <path d="m0 0H512V512H0" fill="#fff"></path>
              <path
                fill="#34a853"
                d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
              ></path>
              <path
                fill="#4285f4"
                d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
              ></path>
              <path
                fill="#fbbc02"
                d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
              ></path>
              <path
                fill="#ea4335"
                d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
              ></path>
            </g>
          </svg>
          Login with Google
        </button>
      </div>
    </div>
  );
}
