output "staging_namespace" {
  description = "The namespace Terraform created"
  value       = kubernetes_namespace.kijani_staging.metadata[0].name
}