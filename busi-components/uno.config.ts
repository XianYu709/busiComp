import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss';

export default defineConfig({
  shortcuts: {},
  theme: {
    colors: {
      // 主色和辅助色
      primary: '#0E5FC7',
      secondary: {
        1: '#4C9FD3',
        2: '#898BFF',
        3: '#DD5F24'
      },
      // 次要辅助色
      light: {
        1: '#E7EFF9',
        2: '#EEEEFF',
        3: '#FAE7DE',
        4: '#DBE7F7'
      },
      // 功能色
      success: {
        DEFAULT: '#20A28B',
        light: '#DEF1EE'
      },
      warning: {
        DEFAULT: '#EB1919',
        light: '#FCDDDD'
      },
      pending: {
        DEFAULT: '#D3AA4C',
        light: '#F9F3E4'
      },
      // 文字颜色
      text: {
        box: '#F5F6F7',
        divider: '#E8E8E8',
        disabled: '#C8C8C8',
        assist: '#999999',
        content: '#666666',
        title: '#333333'
      }
    },
    fontSize: {
      h1: '48px',
      subtitle: '36px',
      h2: '24px',
      h3: '18px',
      h4: '16px',
      content: '14px',
      caption: '12px',
      badge: '10px'
    },
    borderRadius: {
      sm: '2px',
      md: '4px',
      lg: '8px',
      xl: '16px',
      full: '999px'
    },
    boxShadow: {
      sm: '0px 4px 5px 0px rgba(0,0,0,0)',
      md: '0px 4px 10px 0px rgba(0,0,0,0.05)',
      lg: '0px 4px 20px 0px rgba(0,0,0,0.15)'
    }
  },
  rules: [
    // 自定义行高规则
    ['leading-tight', {'line-height': 'calc(1em + 8px)'}],    // 字体族规则
    ['font-cn', {'font-family': '"Source Han Sans", sans-serif'}],
    ['font-en', {'font-family': 'Arial, sans-serif'}]
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetTypography(),
    presetWebFonts({
      fonts: {}
    })
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()]
});
