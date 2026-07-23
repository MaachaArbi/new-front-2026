import { useI18n } from '@/app/providers/i18n-provider'
import { Input, InputWrapper } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'

// Prélevé de layout-21/components/sidebar-search.tsx. Placeholder i18n ; la
// palette ⌘K réelle arrive en S9 (ADR-F20 §F20.8).
export function SidebarSearch() {
  const { t } = useI18n()

  return (
    <div className="flex shrink-0 px-5 pt-3.5">
      <InputWrapper>
        <Input type="search" placeholder={t('layout.search')} />
        <Badge variant="outline" className="whitespace-nowrap" size="sm">
          ⌘ K
        </Badge>
      </InputWrapper>
    </div>
  )
}
