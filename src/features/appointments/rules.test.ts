import { canCancelAt, formatAppointmentDate } from "./rules";
import type { Appointment } from "../../services/types";
it.each([
  [86400001, true],
  [86400000, true],
  [86399999, false],
])("limite de %i ms: %s", (remaining, expected) => {
  const now = Date.parse("2026-10-12T12:00:00Z");
  expect(
    canCancelAt(new Date(now + Number(remaining)).toISOString(), now),
  ).toBe(expected);
});
it("bloqueia data inválida e consulta passada", () => {
  expect(canCancelAt("bad", Date.now())).toBe(false);
  expect(canCancelAt("2020-01-01T00:00:00Z", Date.now())).toBe(false);
});
it("preserva o dia no fuso da clínica", () => {
  const appointment = {
    startsAt: "2026-10-13T00:30:00-03:00",
    clinicTimeZone: "America/Sao_Paulo",
  } as Appointment;
  expect(formatAppointmentDate(appointment)).toContain("13 de outubro");
});
