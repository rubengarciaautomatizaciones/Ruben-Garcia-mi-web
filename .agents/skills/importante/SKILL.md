---
name: importante
description: Activa el protocolo de preguntas obligatorias antes de ejecutar cualquier tarea. Cuando el usuario escribe /importante, el agente debe detenerse y preguntar todo lo que necesite antes de proceder.
---

# Skill: /importante

## Comportamiento

Cuando el usuario invoque este skill (escribiendo `/importante` o mencionando "importante" como directiva), aplica el siguiente protocolo **antes de ejecutar cualquier tarea**:

1. **DETENTE** inmediatamente. No ejecutes ninguna acción.
2. **ANALIZA** si tienes toda la información y contexto necesarios para completar la tarea con excelencia.
3. **PREGUNTA** todo lo que necesites saber. No supongas datos faltantes. No asumas intenciones.
4. **ESPERA** a que el usuario responda todas las preguntas.
5. **SOLO ENTONCES** procede con la ejecución.

## Regla

Este skill equivale a que el usuario escriba textualmente:

> **IMPORTANTE: Pregúntame todas las preguntas que necesites que te responda antes de proceder.**

## Cuándo aplica

- Siempre que el usuario escriba `/importante` al final o al inicio de su mensaje.
- El agente debe tratar TODAS las ambigüedades como bloqueantes. No avanzar sin clarificación.
