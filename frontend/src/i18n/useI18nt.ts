import { useI18n } from 'vue-i18n'

/**
 * 带类型的 useI18n 封装
 * 使用方式：const { t } = useI18nt()
 * 在模板中直接用 t('namespace.key') 即可
 */
export function useI18nt() {
  const { t, locale } = useI18n()
  return { t, locale }
}
