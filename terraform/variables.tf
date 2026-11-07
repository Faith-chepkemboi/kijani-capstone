variable "kubeconfig_path" {
  description = "Path to the kubeconfig file that points at Minikube"
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "Which cluster in the kubeconfig to use"
  type        = string
  default     = "minikube"
}

variable "staging_namespace" {
  description = "Name of the staging namespace"
  type        = string
  default     = "kijani-staging"
}