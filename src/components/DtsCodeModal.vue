<template>
  <el-dialog
    :model-value="visible"
    title="DTS 代码"
    width="520px"
    @close="$emit('update:visible', false)"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    align-center
  >
    <pre class="dts-code">
/dts-v1/;

&sol; {
    model = "My Device Tree";
    compatible = "my,device-tree";
    node@0 {
        reg = <0x0 0x1000>;
    };
};
    </pre>
    <template #footer>
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElDialog, ElButton } from 'element-plus'
defineProps<{ visible: boolean }>()
defineEmits(['update:visible'])
</script>

<style scoped>
.dts-code {
  background: #f7f7f7;
  margin: 0;
  padding: 18px 20px;
  border-radius: 6px;
  font-size: 15px;
  font-family: 'Fira Mono', 'Consolas', monospace;
  white-space: pre-wrap;
}
</style>