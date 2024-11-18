import SignInForm from './login-form';

export const metadata = {
  title: 'Login',
};

const LoginPage = () => {
  return (
    <main className="h-dvh w-full p-1">
      <div className="relative grid h-full w-full overflow-hidden p-4 lg:grid-cols-12">
        <div
          style={{
            backgroundImage: `url('/bg.jpg')`,
            backgroundPosition: 'center',
          }}
          className="hidden rounded-xl lg:col-span-7 lg:block 2xl:col-span-8"
        ></div>
        <div className="flex items-start justify-center rounded-[10px] bg-white lg:col-span-5 lg:items-center 2xl:col-span-4">
          <SignInForm />
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
