<script setup lang="ts">
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { formatChartValue, formatCompactNumber, type ChartValueFormat } from '../utils/chartFormatting';

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent]);

const props = defineProps<{
  title: string;
  type: 'bar' | 'line' | 'pie';
  data: { name?: string; month?: string; value: number }[];
  valueFormat?: ChartValueFormat;
}>();

const valueFormat = computed(() => props.valueFormat ?? 'currency');
const xAxisLabels = computed(() => props.data.map((item) => item.name ?? item.month));
const xAxisInterval = computed(() => (props.type === 'line' && xAxisLabels.value.length > 12 ? Math.ceil(xAxisLabels.value.length / 12) - 1 : 0));

const option = computed(() => {
  if (props.type === 'pie') {
    return {
      tooltip: {
        trigger: 'item',
        valueFormatter: (value: number) => formatChartValue(value, valueFormat.value),
      },
      legend: {
        type: 'scroll',
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#475569', fontSize: 12 },
      },
      series: [
        {
          type: 'pie',
          radius: ['42%', '68%'],
          center: ['50%', '43%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: props.data,
        },
      ],
    };
  }
  return {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => formatChartValue(value, valueFormat.value),
    },
    grid: { left: 56, right: 24, top: 20, bottom: props.type === 'line' ? 72 : 48, containLabel: true },
    xAxis: {
      type: 'category',
      data: xAxisLabels.value,
      axisLabel: {
        interval: xAxisInterval.value,
        rotate: props.type === 'line' ? 35 : 0,
        margin: props.type === 'line' ? 16 : 8,
        width: props.type === 'line' ? 86 : 72,
        overflow: 'truncate',
        color: '#6b7280',
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => (valueFormat.value === 'currency' ? formatCompactNumber(value) : formatChartValue(value, valueFormat.value)),
        color: '#6b7280',
      },
      splitLine: { lineStyle: { color: '#e2e8f0' } },
    },
    series: [{ type: props.type, data: props.data.map((item) => item.value), color: '#1f9d6a' }],
  };
});
</script>

<template>
  <div class="panel p-5">
    <h3 class="mb-4 text-sm font-semibold text-ink">{{ title }}</h3>
    <VChart class="h-72 w-full" :option="option" autoresize />
  </div>
</template>
