{{- define "v4.labels" -}}
stack: v4
{{- end -}}

{{- define "v4.secretName" -}}
{{ .Values.existingSecretName | default "v4" }}
{{- end -}}

{{- define "v4.tlsSecretName" -}}
tls-v4
{{- end -}}
