import { withUniwind } from 'uniwind';

import { Icon as BaseIcon } from './Icon';

// Explorer adaptation: upstream calls `cssInterop(Icon, ...)` with a
// `nativeStyleToProp` map so that className-driven color/size land on Icon's
// own props. NativeWind mutates the component in place; Uniwind's equivalent
// returns a new one, and expresses the same mapping as per-prop options.
const Icon = withUniwind(BaseIcon, {
  color: { fromClassName: 'colorClassName', styleProperty: 'color' },
  size: { fromClassName: 'sizeClassName', styleProperty: 'width' },
});

export { Icon };
