import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="md:col-span-2 lg:col-span-1">
            <Link to="/" className="logo flex items-center mb-4">
              <div className="logo-icon bg-primary w-8 h-8 rounded-lg mr-2 flex items-center justify-center">
                <i className="fas fa-leaf text-white text-sm" />
              </div>
              <span className="logo-text font-bold text-2xl text-white">EcoDana</span>
            </Link>
            <p className="text-sm text-gray-400">
              EcoDana la nen tang cho thue xe dien hang dau, mang den giai phap di chuyen xanh, sach va tien loi.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Kham pha</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Trang chu
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="text-gray-400 hover:text-primary transition-colors">
                  Cac loai xe
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  Ve chung toi
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  Lien he
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Lien he</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt text-primary w-4 mt-1 mr-3" />
                <span className="text-gray-400">Khu do thi FPT, Ngu Hanh Son, Da Nang</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope text-primary w-4 mr-3" />
                <a href="mailto:support@ecodana.vn" className="text-gray-400 hover:text-primary transition-colors">
                  support@ecodana.vn
                </a>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone-alt text-primary w-4 mr-3" />
                <a href="tel:0236123456" className="text-gray-400 hover:text-primary transition-colors">
                  0236 123 456
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Theo doi chung toi</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <i className="fab fa-facebook-f text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <i className="fab fa-instagram text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <i className="fab fa-youtube text-xl" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} EcoDana. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
