import { RouterProvider } from 'react-router';
import { router } from './utils/routes';

export default function App() {
  return (
    <>
      <div style={{ backgroundColor: 'red', color: 'white', padding: '20px', textAlign: 'center', fontSize: '24px', fontWeight: 'bold', zIndex: 9999, position: 'relative' }}>
        DIAGNOSTIC MODE: v2.5 - IF YOU SEE THIS, THE CODE IS UPDATED
      </div>
      <RouterProvider router={router} />
    </>
  );
}
