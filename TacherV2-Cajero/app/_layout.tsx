import '@/global.css';

import { PortalHost } from '@rn-primitives/portal';
import StackPrincipal from '@/src/stacks';
import ProveedorTemaOscuroClaro from '@/src/TemaOscuroClaro';
export {FeedBackPorDefecto as ErrorBoundary} from '@/src/feedBacks';

export default function RootLayout() {
  
  return (
    <ProveedorTemaOscuroClaro>
        <StackPrincipal/>
        <PortalHost />
    </ProveedorTemaOscuroClaro>
  );
}
