import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getVehicles } from '../../api/vehicleApi';
import type { Vehicle } from '../../types/vehicle';

const DEFAULT_LOCATION = 'Khu do thi FPT City, Phuong Ngu Hanh Son, Thanh pho Da Nang';

type TagType = 'needs' | 'trend' | 'budget';

const trendMapping: Record<string, string> = {
  'Xe o to dien': 'ElectricCar',
  'Xe may dien': 'ElectricMotorcycle',
};

const budgetMapping: Record<string, string> = {
  'Duoi 500 nghin': 'under500k',
  'Tren 500 nghin': 'over500k',
};

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);

  const [searchPopupOpen, setSearchPopupOpen] = useState(false);
  const [locationPopupOpen, setLocationPopupOpen] = useState(false);
  const [datePopupOpen, setDatePopupOpen] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_LOCATION);
  const [locationInput, setLocationInput] = useState(DEFAULT_LOCATION);

  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<string>('');
  const [selectedBudget, setSelectedBudget] = useState<string>('');

  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [pickupTime, setPickupTime] = useState('09:00');
  const [returnTime, setReturnTime] = useState('11:00');

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const data = await getVehicles();
        setFeaturedVehicles(data.slice(0, 8));
      } catch {
        setFeaturedVehicles([]);
      }
    };

    void loadFeatured();
  }, []);

  const selectedLocationDisplay = useMemo(() => {
    const tags: string[] = [];
    if (selectedNeeds.length > 0) tags.push(...selectedNeeds);
    if (selectedTrend) tags.push(selectedTrend);
    if (selectedBudget) tags.push(selectedBudget);

    if (tags.length === 0) {
      return selectedLocation;
    }

    return `${selectedLocation} [${tags.join(', ')}]`;
  }, [selectedLocation, selectedNeeds, selectedTrend, selectedBudget]);

  const dateTimeDisplay = useMemo(() => {
    if (!pickupDate || !returnDate) {
      return 'Chon ngay nhan va tra xe';
    }

    const pickup = new Date(`${pickupDate}T${pickupTime}:00`);
    const ret = new Date(`${returnDate}T${returnTime}:00`);

    return `${pickup.toLocaleDateString('vi-VN')}, ${pickupTime} - ${ret.toLocaleDateString('vi-VN')}, ${returnTime}`;
  }, [pickupDate, returnDate, pickupTime, returnTime]);

  const toggleTag = (section: TagType, value: string) => {
    if (section === 'needs') {
      setSelectedNeeds((prev) => (prev.includes(value) ? prev.filter((tag) => tag !== value) : [...prev, value]));
      return;
    }

    if (section === 'trend') {
      setSelectedTrend((prev) => (prev === value ? '' : value));
      return;
    }

    setSelectedBudget((prev) => (prev === value ? '' : value));
  };

  const performSearch = () => {
    const query = new URLSearchParams();

    if (selectedLocation && selectedLocation !== DEFAULT_LOCATION) {
      query.set('location', selectedLocation);
    }

    if (pickupDate && returnDate) {
      query.set('pickupDate', pickupDate);
      query.set('returnDate', returnDate);
      query.set('pickupTime', pickupTime);
      query.set('returnTime', returnTime);
    }

    if (selectedNeeds.length > 0) {
      query.set('category', selectedNeeds[selectedNeeds.length - 1]);
    }

    if (selectedTrend) {
      const mapped = trendMapping[selectedTrend];
      if (mapped) query.set('vehicleType', mapped);
    }

    if (selectedBudget) {
      const mapped = budgetMapping[selectedBudget];
      if (mapped) query.set('budget', mapped);
    }

    navigate(`/vehicles?${query.toString()}`);
  };

  const applyLocation = () => {
    setSelectedLocation(locationInput.trim() || DEFAULT_LOCATION);
    setLocationPopupOpen(false);
    setSearchPopupOpen(true);
  };

  return (
    <>
      <section className="hero pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="relative rounded-lg shadow-xl overflow-hidden">
            <img src="/images/tripview.png" alt="Ung dung cho thue xe" className="w-full" />
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Tim, Dat va Thue xe de dang</h1>
              <p className="text-xl mb-8">Thue xe o bat cu dau va bat cu khi nao ban can.</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 bg-white rounded-xl shadow-lg p-6 -mb-16 relative z-10 max-w-5xl">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="search-field flex items-center space-x-4 p-4 border rounded-lg flex-1 cursor-pointer" onClick={() => setSearchPopupOpen(true)}>
              <div className="search-icon text-primary text-xl">
                <i className="fas fa-map-marker-alt" />
              </div>
              <div className="search-details flex-grow">
                <h4 className="font-semibold">Dia diem</h4>
                <p className="text-gray-500">{selectedLocationDisplay}</p>
              </div>
              <div className="search-icon text-primary text-xl ml-auto">
                <i className="fas fa-chevron-down" />
              </div>
            </div>

            <div className="search-field flex items-center space-x-4 p-4 border rounded-lg flex-1 cursor-pointer" onClick={() => setDatePopupOpen(true)}>
              <div className="search-icon text-primary text-xl">
                <i className="fas fa-calendar" />
              </div>
              <div className="search-details flex-grow">
                <h4 className="font-semibold">Ngay nhan & tra xe</h4>
                <p className="text-gray-500">{dateTimeDisplay}</p>
              </div>
              <div className="search-icon text-primary text-xl ml-auto">
                <i className="fas fa-chevron-down" />
              </div>
            </div>

            <button id="quick-search-btn" onClick={performSearch} className="search-btn bg-primary text-white px-6 py-4 rounded-lg hover:bg-accent transition-colors flex items-center">
              Tim kiem <i className="fas fa-arrow-right ml-2" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="section-badge bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-semibold inline-block mb-4">CACH THUC HOAT DONG</div>
            <h2 className="section-title text-3xl md:text-4xl font-bold text-gray-800 mb-12">Thue xe voi 3 buoc don gian</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="step text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="step-icon bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
                <i className="fas fa-map-marker-alt" />
              </div>
              <h3 className="step-title text-xl font-semibold mb-2">Chon dia diem</h3>
              <p className="step-description text-gray-600">Nhap vi tri cua ban va tim xe o gan</p>
            </div>

            <div className="step text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="step-icon bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
                <i className="fas fa-calendar" />
              </div>
              <h3 className="step-title text-xl font-semibold mb-2">Chon ngay nhan xe</h3>
              <p className="step-description text-gray-600">Chon ngay va gio ban muon dat</p>
            </div>

            <div className="step text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="step-icon bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl mb-4">
                <i className="fas fa-car" />
              </div>
              <h3 className="step-title text-xl font-semibold mb-2">Dat xe</h3>
              <p className="step-description text-gray-600">Dat xe va chung toi se giao xe tan noi</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="section-badge bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-sm font-semibold inline-block mb-4">UU DAI THUE XE HAP DAN</div>
            <h2 className="section-title text-3xl md:text-4xl font-bold text-gray-800">Cac uu dai thue xe pho bien nhat</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredVehicles.map((vehicle) => (
              <div key={vehicle.vehicleId} className="car-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <Link to={`/vehicles/${vehicle.vehicleId}`} className="block h-48 overflow-hidden">
                  <img
                    src={vehicle.mainImageUrl || 'https://via.placeholder.com/400x224?text=No+Image'}
                    alt={vehicle.vehicleModel}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </Link>
                <div className="car-details p-6">
                  <h3 className="car-title text-xl font-semibold mb-2">{vehicle.vehicleModel}</h3>
                  <div className="car-type mb-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{vehicle.vehicleType}</span>
                  </div>

                  <div className="car-specs grid grid-cols-2 gap-2 mb-4">
                    <div className="spec flex items-center text-sm text-gray-600">
                      <i className="fas fa-user mr-2 text-primary" />
                      <span>{vehicle.seats} cho</span>
                    </div>
                    <div className="spec flex items-center text-sm text-gray-600">
                      <i className={`${vehicle.requiresLicense ? 'fas fa-id-card' : 'fas fa-ban'} mr-2 text-primary`} />
                      <span>{vehicle.requiresLicense ? 'Yeu cau bang lai' : 'Khong can bang lai'}</span>
                    </div>
                  </div>

                  <div className="price-container flex justify-between items-center mb-4">
                    <span className="price-label text-gray-600">Gia:</span>
                    <span className="price font-bold text-lg">{new Intl.NumberFormat('vi-VN').format(vehicle.dailyPrice)} / ngay</span>
                  </div>

                  <Link
                    to={`/vehicles/${vehicle.vehicleId}`}
                    className="rent-btn w-full bg-primary text-white py-3 rounded-lg hover:bg-accent transition-colors flex items-center justify-center"
                  >
                    Xem chi tiet <i className="fas fa-arrow-right ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/vehicles"
              className="view-all-btn bg-transparent border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center justify-center mx-auto"
            >
              Xem tat ca xe <i className="fas fa-arrow-right ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {searchPopupOpen ? (
        <div id="search-popup" className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setSearchPopupOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-2xl w-full" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Tim kiem</h3>
              <button onClick={() => setSearchPopupOpen(false)} className="text-gray-500 hover:text-gray-800">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="search-field flex items-center space-x-4 p-4 border rounded-lg flex-1 mb-4 cursor-pointer" onClick={() => {
              setSearchPopupOpen(false);
              setLocationPopupOpen(true);
            }}>
              <div className="search-icon text-primary text-xl">
                <i className="fas fa-map-marker-alt" />
              </div>
              <div className="search-details flex-grow">
                <h4 className="font-semibold">Dia diem</h4>
                <p className="text-gray-500">{selectedLocationDisplay}</p>
              </div>
              <div className="search-icon text-primary text-xl ml-auto">
                <i className="fas fa-chevron-down" />
              </div>
            </div>

            <div className="border rounded-lg p-4 mb-4 search-popup-section">
              <h4 className="font-semibold text-gray-800">Theo nhu cau</h4>
              <div className="flex flex-wrap gap-2 mt-2 search-tags">
                {['Cong viec, di lai', 'Gia dinh', 'Tiep khach, du tiec'].map((tag) => (
                  <button
                    key={tag}
                    className={`tag-btn px-4 py-2 rounded-full text-sm ${selectedNeeds.includes(tag) ? 'selected bg-primary text-white' : 'bg-gray-200'}`}
                    onClick={() => toggleTag('needs', tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4 mb-4 search-popup-section">
              <h4 className="font-semibold text-gray-800">Theo xu huong</h4>
              <div className="flex flex-wrap gap-2 mt-2 search-tags">
                {['Xe o to dien', 'Xe may dien'].map((tag) => (
                  <button
                    key={tag}
                    className={`tag-btn px-4 py-2 rounded-full text-sm ${selectedTrend === tag ? 'selected bg-primary text-white' : 'bg-gray-200'}`}
                    onClick={() => toggleTag('trend', tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="border rounded-lg p-4 mb-4 search-popup-section">
              <h4 className="font-semibold text-gray-800">Ngan sach</h4>
              <div className="flex flex-wrap gap-2 mt-2 search-tags">
                {['Duoi 500 nghin', 'Tren 500 nghin'].map((tag) => (
                  <button
                    key={tag}
                    className={`tag-btn px-4 py-2 rounded-full text-sm ${selectedBudget === tag ? 'selected bg-primary text-white' : 'bg-gray-200'}`}
                    onClick={() => toggleTag('budget', tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setSearchPopupOpen(false)} className="w-full bg-primary text-white py-3 rounded-lg hover:bg-accent transition-colors">
              Xac nhan
            </button>
          </div>
        </div>
      ) : null}

      {locationPopupOpen ? (
        <div id="location-popup" className="fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-center justify-center p-4" onClick={() => {
          setLocationPopupOpen(false);
          setSearchPopupOpen(true);
        }}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Dia diem</h3>
              <button onClick={() => {
                setLocationPopupOpen(false);
                setSearchPopupOpen(true);
              }} className="text-gray-500 hover:text-gray-800">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={locationInput}
                  onChange={(event) => setLocationInput(event.target.value)}
                  placeholder="Nhap dia chi hoac chon tren ban do"
                  className="w-full p-3 border rounded-lg focus:ring-primary focus:border-primary pl-10"
                />
                <i className="fas fa-search absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500">Ban do se hien thi o day</div>

            <div className="space-y-3 mb-6">
              <button
                type="button"
                className="w-full border rounded-lg p-3 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(() => {
                      setLocationInput('Vi tri hien tai cua ban');
                    });
                  }
                }}
              >
                <i className="fas fa-location-arrow text-green-500" />
                <p className="text-gray-700 font-semibold">Su dung vi tri hien tai</p>
              </button>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Dia diem goi y:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Khu do thi FPT City, P. Hoa Hai, Q. Ngu Hanh Son, TP. Da Nang',
                    'Duong Duy Tan, P. Hoa Thuan Tay, Q. Hai Chau, TP. Da Nang',
                  ].map((item) => (
                    <button key={item} type="button" className="suggested-location-btn" onClick={() => setLocationInput(item)}>
                      {item.includes('FPT') ? 'Dai hoc FPT' : 'San bay Da Nang'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-xs text-gray-600">Dia diem da chon:</p>
              <p className="font-semibold text-green-800">{locationInput || 'Chua co'}</p>
            </div>

            <button onClick={applyLocation} className="w-full mt-6 bg-primary text-white py-3 rounded-lg hover:bg-accent transition-colors font-semibold">
              Xac nhan
            </button>
          </div>
        </div>
      ) : null}

      {datePopupOpen ? (
        <div id="date-time-popup" className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setDatePopupOpen(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-2xl w-full" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Thoi gian</h3>
              <button onClick={() => setDatePopupOpen(false)} className="text-gray-500 hover:text-gray-800">
                <i className="fas fa-times" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Ngay nhan xe</span>
                <input type="date" value={pickupDate} onChange={(event) => setPickupDate(event.target.value)} className="w-full mt-1 p-3 border rounded-lg" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Ngay tra xe</span>
                <input type="date" value={returnDate} onChange={(event) => setReturnDate(event.target.value)} className="w-full mt-1 p-3 border rounded-lg" />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Gio nhan xe</span>
                <input type="time" value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} className="w-full mt-1 p-3 border rounded-lg" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Gio tra xe</span>
                <input type="time" value={returnTime} onChange={(event) => setReturnTime(event.target.value)} className="w-full mt-1 p-3 border rounded-lg" />
              </label>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-gray-600">{dateTimeDisplay}</p>
              <button onClick={() => setDatePopupOpen(false)} className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-accent transition-colors font-semibold">
                Tiep tuc
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <style>{`.suggested-location-btn { background-color: #f3f4f6; border-radius: 9999px; padding: 6px 12px; font-size: 0.875rem; color: #4b5563; transition: all 0.2s; border: 1px solid transparent; }
      .suggested-location-btn:hover { background-color: #e5e7eb; color: #1f2937; }`}</style>
    </>
  );
};

export default HomePage;
