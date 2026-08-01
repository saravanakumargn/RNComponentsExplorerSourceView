import { Text, View, useWindowDimensions } from 'react-native';
import * as Svg from 'react-native-svg';
import { CartesianChart, StackedArea } from 'victory-native';

import Example from './Example';

function VictoryChartExample() {
  const { width } = useWindowDimensions();
  return (
    <View>
      <View style={{ height: 280 }}>
        <CartesianChart
          data={[
            { category: 1, first: 2, second: 1, third: 3, fourth: 2 },
            { category: 2, first: 3, second: 4, third: 2, fourth: 3 },
            { category: 3, first: 5, second: 5, third: 6, fourth: 3 },
            { category: 4, first: 4, second: 7, third: 2, fourth: 4 },
            { category: 5, first: 7, second: 5, third: 6, fourth: 7 },
          ]}
          xKey="category"
          yKeys={['first', 'second', 'third', 'fourth']}
        >
          {({ chartBounds, points }) => (
            <StackedArea
              animate={{ type: 'timing' }}
              colors={['#7c3aed', '#a78bfa', '#c4b5fd', '#ddd6fe']}
              points={[points.first, points.second, points.third, points.fourth]}
              y0={chartBounds.bottom}
            />
          )}
        </CartesianChart>
      </View>
      <Svg.Svg width={width} height={50}>
        <Svg.Text fill="#fff" stroke="#000" fontSize={18} fontFamily="space-mono" x={25} y={15}>
          drawn with victory-native
        </Svg.Text>
      </Svg.Svg>
    </View>
  );
}
VictoryChartExample.title = 'VictoryChart';

const icon = <Text>VN</Text>;

const VictoryNative: Example = {
  icon,
  samples: [VictoryChartExample],
};

export default VictoryNative;
