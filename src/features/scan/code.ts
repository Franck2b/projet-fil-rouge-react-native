/**
 * Les QR codes collés sur les machines encodent soit un lien profond
 * `gabarit://machine/<slug>`, soit l'URL de la fiche sur le site web. Les deux
 * doivent marcher : un membre sans l'app tombe sur le site, un membre avec
 * l'app arrive sur l'écran d'arrivée.
 *
 * On ne renvoie que le slug ; c'est le serveur qui dit si la machine existe.
 */

const DEEP_LINK = /^gabarit:\/\/machine\/([a-z0-9-]+)$/i;
const WEB_LINK = /\/(?:equipements|machines)\/([a-z0-9-]+)\/?$/i;

export function parseMachineCode(value: string): string | null {
  const trimmed = value.trim();

  const deepLink = DEEP_LINK.exec(trimmed);
  if (deepLink) return deepLink[1].toLowerCase();

  const webLink = WEB_LINK.exec(trimmed.split("?")[0]);
  if (webLink) return webLink[1].toLowerCase();

  return null;
}
