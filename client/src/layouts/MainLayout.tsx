import { Outlet } from 'react-router-dom';
import { ChatbotWidget } from '../components/common/ChatbotWidget';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
      <ChatbotWidget />
    </div>
  );
};

export default MainLayout;
