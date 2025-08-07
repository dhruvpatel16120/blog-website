import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import { getAllPosts } from '@/lib/posts';

const Layout = async ({ children, showSidebar = true }) => {
  const allPosts = getAllPosts({ page: 1, limit: 100 }).posts;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <Header />
      <main className="flex-1">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className={cn(
              'xl:col-span-3',
              showSidebar ? 'xl:col-span-3' : 'xl:col-span-4'
            )}>
              {children}
            </div>
            {/* Sidebar */}
            {showSidebar && (
              <div className="xl:col-span-1">
                <Sidebar allPosts={allPosts} />
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout; 