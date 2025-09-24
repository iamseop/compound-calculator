import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full max-w-3xl mx-auto mt-12 py-6 text-center text-gray-400 text-sm border-t border-border">
      <p className="mb-2">Made by <a href = "https://abel.io.kr/" target = "blank" className="text-gray-400 hover:underline"> abel.io.kr </a></p>
      <p>사이트 문제나 건의사항은 <a href="mailto:lucky_77_@naver.com" className="text-gray-400 hover:underline">lucky_77_@naver.com</a> 로 연락 주세요.</p>
    </footer>
  );
};

export default Footer;
