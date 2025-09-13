import Link from 'next/link';

interface NavigationItem {
  href: string;
  label: string;
}

const Header: React.FC = () => {
  const navigationItems: NavigationItem[] = [
    { href: "/main", label: "Dashboard" },
    { href: "/main#competitions", label: "Competitions" },
    { href: "/main#timeline", label: "Timeline" }
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-2xl font-bold text-red-600 cursor-pointer">VK Competitions</span>
              </Link>
            </div>
            <nav className="ml-10 flex items-center space-x-4">
              {navigationItems.map((item: NavigationItem, index: number) => (
                <Link key={index} href={item.href}>
                  <span className="text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium cursor-pointer">
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
              U
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;