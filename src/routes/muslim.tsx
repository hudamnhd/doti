import Footer from '#src/components/custom/footer';
import { Header } from '#src/components/custom/header';
import { NavigationList } from '#src/components/custom/navigation-list.tsx';
import { muslimNavigationLink } from '#src/constants/nav-link';

export function Component() {
  const data = muslimNavigationLink;

  return (
    <>
      <Header redirectTo='/' title='Muslim' />

      <div className='text-center pt-3 mb-1'>
        <div className='text-center text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]'>
          Muslim
        </div>
        <p className='text-muted-foreground'>
          Aplikasi muslim sehari-hari
        </p>
      </div>

      <NavigationList data={data} />

      <Footer />
    </>
  );
}
