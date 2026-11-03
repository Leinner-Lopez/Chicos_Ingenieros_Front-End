import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { LanguageSwitcher } from './language-switcher';
import { LANG_STORAGE_KEY } from '../../i18n/language';

describe('LanguageSwitcher', () => {
  let fixture: ComponentFixture<LanguageSwitcher>;
  let component: LanguageSwitcher;
  let transloco: TranslocoService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LanguageSwitcher] }).compileComponents();
    transloco = TestBed.inject(TranslocoService);
    fixture = TestBed.createComponent(LanguageSwitcher);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem(LANG_STORAGE_KEY));

  it('debe mostrar un botón por idioma disponible', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent.trim()).toBe('ES');
    expect(buttons[1].textContent.trim()).toBe('EN');
  });

  it('debe marcar el idioma activo', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
  });

  it('setLang("en") debe cambiar el idioma, el atributo lang y guardar la preferencia', () => {
    component.setLang('en');
    fixture.detectChanges();
    expect(transloco.getActiveLang()).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');
    expect(component.active()).toBe('en');
  });

  it('el cambio de idioma debe traducir el texto', () => {
    component.setLang('en');
    expect(transloco.translate('common.logout')).toBe('Log out');
    component.setLang('es');
    expect(transloco.translate('common.logout')).toBe('Cerrar sesión');
  });
});
