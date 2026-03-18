import { Outlet } from 'react-router-dom';
import { OwnerSidebar } from '../components/layout/OwnerSidebar';

const OwnerLayout = () => {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <OwnerSidebar />
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default OwnerLayout;
