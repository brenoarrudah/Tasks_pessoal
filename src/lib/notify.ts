/**
 * Barramento simples de notificações de erro.
 * Qualquer camada (contextos, componentes) pode chamar `notifyError()` e o
 * `ErrorToastHost` montado no App exibe o Toast visual para o utilizador.
 */
export const APP_ERROR_EVENT = 'app:error';

export const DEFAULT_ERROR_MESSAGE = 'Falha ao sincronizar com o Sistema';

export function notifyError(message: string = DEFAULT_ERROR_MESSAGE): void {
  window.dispatchEvent(new CustomEvent<string>(APP_ERROR_EVENT, { detail: message }));
}
