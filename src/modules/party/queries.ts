/**
 * Hooks TanStack Query du module Party (ADR-013).
 *
 * `placeholderData: keepPreviousData` : au changement de page/filtre, les données
 * précédentes restent affichées (la liste ne clignote pas — ADR-F20.4).
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import {
  listPartyAccounts,
  getPartyAccount,
  getPartyAddresses,
  patchPartyAccount,
  deletePartyAccount,
  createPartyAccount,
  putPersonIdentity,
  putOrganizationIdentity,
  createPartyAddress,
  updatePartyAddress,
  deletePartyAddress,
  assignPartyRole,
  revokePartyRole,
  requestLogoUploadIntent,
  uploadToStorage,
  confirmLogo,
  deletePartyLogo,
  listPartyHistory,
  assignPartyFunction,
  revokePartyFunction,
  anonymizePartyAccount,
  createPartyDocument,
  updatePartyDocument,
  deletePartyDocument,
  requestDocumentFileUploadIntent,
  confirmDocumentFile,
  deleteDocumentFile,
  createCreditLimit,
  deleteCreditLimit,
  createManager,
  deleteManager,
  createTaxExemption,
  updateTaxExemptionCertificate,
  deleteTaxExemption,
  putCommercialPolicy,
  createApprovalRule,
  deleteApprovalRule,
  type ListPartyParams,
  type PartyDocumentInput,
  type PartyCreditLimitInput,
  type PartyManagerInput,
  type PartyTaxExemptionInput,
  type PartyTaxExemptionCertificateInput,
  type PartyCommercialPolicyInput,
  type PartyApprovalRuleInput,
  type PartyAccountPatch,
  type PartyPersonIdentityInput,
  type PartyOrganizationIdentityInput,
  type PartyAddressInput,
  type PartyAccountCreate,
} from './api'

const PARTY_KEY = 'party-accounts'

export function usePartyAccounts(params: ListPartyParams) {
  return useQuery({
    queryKey: [PARTY_KEY, 'list', params],
    queryFn: () => listPartyAccounts(params),
    placeholderData: keepPreviousData,
  })
}

export function usePartyAccount(publicId: string | null) {
  return useQuery({
    queryKey: [PARTY_KEY, 'detail', publicId],
    queryFn: () => getPartyAccount(publicId as string),
    enabled: publicId !== null,
  })
}

export function usePartyAddresses(publicId: string | null) {
  return useQuery({
    queryKey: [PARTY_KEY, 'addresses', publicId],
    queryFn: () => getPartyAddresses(publicId as string),
    enabled: publicId !== null,
  })
}

/** Création d'un tiers ; invalide la liste au succès. Renvoie le `publicId`. */
export function useCreatePartyAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PartyAccountCreate) => createPartyAccount(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [PARTY_KEY, 'list'] }),
  })
}

/** `PATCH` un tiers ; invalide la fiche et la liste au succès. */
export function usePatchPartyAccount(publicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: PartyAccountPatch) =>
      patchPartyAccount(publicId, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PARTY_KEY, 'detail', publicId],
      })
      // `party_account` est audité → l'historique doit refléter le changement.
      queryClient.invalidateQueries({
        queryKey: [PARTY_KEY, 'history', publicId],
      })
      queryClient.invalidateQueries({ queryKey: [PARTY_KEY, 'list'] })
    },
  })
}

/** Anonymisation RGPD (irréversible). Invalide la fiche (elle devient anonymisée) ET la liste. */
export function useAnonymizePartyAccount(publicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => anonymizePartyAccount(publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PARTY_KEY, 'detail', publicId],
      })
      queryClient.invalidateQueries({
        queryKey: [PARTY_KEY, 'history', publicId],
      })
      queryClient.invalidateQueries({ queryKey: [PARTY_KEY, 'list'] })
    },
  })
}

/** Suppression douce ; invalide la liste au succès. */
export function useDeletePartyAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (publicId: string) => deletePartyAccount(publicId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [PARTY_KEY, 'list'] }),
  })
}

/** `PUT` identité (bloc entier). Invalide la fiche au succès. */
export function usePutPersonIdentity(publicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (block: PartyPersonIdentityInput) =>
      putPersonIdentity(publicId, block),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [PARTY_KEY, 'detail', publicId],
      }),
  })
}

export function usePutOrganizationIdentity(publicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (block: PartyOrganizationIdentityInput) =>
      putOrganizationIdentity(publicId, block),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [PARTY_KEY, 'detail', publicId],
      }),
  })
}

/** CRUD adresses (les adresses vivent dans la fiche → on invalide la fiche). */
export function usePartyAddressMutations(publicId: string) {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [PARTY_KEY, 'detail', publicId] })

  const create = useMutation({
    mutationFn: (input: PartyAddressInput) =>
      createPartyAddress(publicId, input),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: (vars: { addressPublicId: string; input: PartyAddressInput }) =>
      updatePartyAddress(publicId, vars.addressPublicId, vars.input),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (addressPublicId: string) =>
      deletePartyAddress(publicId, addressPublicId),
    onSuccess: invalidate,
  })

  return { create, update, remove }
}

/** Rôles : assigner / révoquer. Invalide la fiche ET la liste (le rôle filtre). */
export function usePartyRoleMutations(publicId: string) {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [PARTY_KEY, 'detail', publicId] })
    queryClient.invalidateQueries({ queryKey: [PARTY_KEY, 'list'] })
  }
  const assign = useMutation({
    mutationFn: (roleCode: string) => assignPartyRole(publicId, roleCode),
    onSuccess: invalidate,
  })
  const revoke = useMutation({
    mutationFn: (roleCode: string) => revokePartyRole(publicId, roleCode),
    onSuccess: invalidate,
  })
  return { assign, revoke }
}

/**
 * Interlocuteurs d'une **organisation** : inscrire / retirer une personne. Le paramètre est
 * le `publicId` de l'ORGANISATION (pour invalider sa fiche, où les contacts apparaissent) ;
 * l'appel porte `personPublicId` + `organizationAccountId`.
 */
export function usePartyFunctionMutations(organizationPublicId: string) {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [PARTY_KEY, 'detail', organizationPublicId],
    })
    queryClient.invalidateQueries({ queryKey: [PARTY_KEY, 'list'] })
  }
  const assign = useMutation({
    mutationFn: (input: {
      personPublicId: string
      organizationAccountId: number
      functionCode: string
    }) =>
      assignPartyFunction(input.personPublicId, {
        organizationAccountId: input.organizationAccountId,
        functionCode: input.functionCode,
      }),
    onSuccess: invalidate,
  })
  const revoke = useMutation({
    mutationFn: (input: {
      personPublicId: string
      organizationAccountId: number
      functionCode: string
    }) =>
      revokePartyFunction(input.personPublicId, {
        organizationAccountId: input.organizationAccountId,
        functionCode: input.functionCode,
      }),
    onSuccess: invalidate,
  })
  return { assign, revoke }
}

/**
 * Documents d'un tiers : créer / éditer / supprimer + **fichier** (déposer en 3 temps,
 * retirer). Invalide la fiche au succès. La LECTURE du fichier (lien signé) n'est pas ici :
 * elle s'appelle à la demande (`getDocumentReadLink`), jamais mise en cache.
 */
export function usePartyDocumentMutations(publicId: string) {
  const queryClient = useQueryClient()
  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: [PARTY_KEY, 'detail', publicId],
    })
  const create = useMutation({
    mutationFn: (input: PartyDocumentInput) =>
      createPartyDocument(publicId, input),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: (vars: {
      documentPublicId: string
      input: PartyDocumentInput
    }) => updatePartyDocument(publicId, vars.documentPublicId, vars.input),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (documentPublicId: string) =>
      deletePartyDocument(publicId, documentPublicId),
    onSuccess: invalidate,
  })
  const setFile = useMutation({
    mutationFn: async (vars: { documentPublicId: string; file: File }) => {
      const intent = await requestDocumentFileUploadIntent(
        publicId,
        vars.documentPublicId,
        { contentType: vars.file.type, sizeBytes: vars.file.size }
      )
      await uploadToStorage(intent, vars.file)
      await confirmDocumentFile(publicId, vars.documentPublicId, intent.fileKey)
    },
    onSuccess: invalidate,
  })
  const removeFile = useMutation({
    mutationFn: (documentPublicId: string) =>
      deleteDocumentFile(publicId, documentPublicId),
    onSuccess: invalidate,
  })
  return { create, update, remove, setFile, removeFile }
}

/**
 * Réglages finance : **plafonds de crédit** + **chargés de compte** (ajouter / retirer).
 * Invalide la fiche au succès. Aucun de ces réglages ne déclenche quoi que ce soit.
 */
export function usePartyFinanceMutations(publicId: string) {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: [PARTY_KEY, 'detail', publicId],
    })
    // `party_account_credit_limit` est audité → rafraîchir aussi l'historique.
    queryClient.invalidateQueries({
      queryKey: [PARTY_KEY, 'history', publicId],
    })
  }
  const creditLimit = {
    create: useMutation({
      mutationFn: (input: PartyCreditLimitInput) =>
        createCreditLimit(publicId, input),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (creditLimitPublicId: string) =>
        deleteCreditLimit(publicId, creditLimitPublicId),
      onSuccess: invalidate,
    }),
  }
  const manager = {
    create: useMutation({
      mutationFn: (input: PartyManagerInput) => createManager(publicId, input),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (managerPublicId: string) =>
        deleteManager(publicId, managerPublicId),
      onSuccess: invalidate,
    }),
  }
  const taxExemption = {
    create: useMutation({
      mutationFn: (input: PartyTaxExemptionInput) =>
        createTaxExemption(publicId, input),
      onSuccess: invalidate,
    }),
    updateCertificate: useMutation({
      mutationFn: (vars: {
        exemptionPublicId: string
        input: PartyTaxExemptionCertificateInput
      }) =>
        updateTaxExemptionCertificate(
          publicId,
          vars.exemptionPublicId,
          vars.input
        ),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (exemptionPublicId: string) =>
        deleteTaxExemption(publicId, exemptionPublicId),
      onSuccess: invalidate,
    }),
  }
  const policy = {
    put: useMutation({
      mutationFn: (input: PartyCommercialPolicyInput) =>
        putCommercialPolicy(publicId, input),
      onSuccess: invalidate,
    }),
  }
  const approvalRule = {
    create: useMutation({
      mutationFn: (input: PartyApprovalRuleInput) =>
        createApprovalRule(publicId, input),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (approvalRulePublicId: string) =>
        deleteApprovalRule(publicId, approvalRulePublicId),
      onSuccess: invalidate,
    }),
  }
  return { creditLimit, manager, taxExemption, policy, approvalRule }
}

/** Historique paginé d'un tiers. `keepPreviousData` : la page précédente reste affichée au changement de page. */
export function usePartyHistory(publicId: string, page: number, limit: number) {
  return useQuery({
    queryKey: [PARTY_KEY, 'history', publicId, page, limit],
    queryFn: () => listPartyHistory(publicId, { page, limit }),
    placeholderData: keepPreviousData,
  })
}

/**
 * Logo : poser (3 temps orchestrés depuis un `File`) / retirer. Invalide la fiche ET
 * la liste (l'avatar y apparaît). `logoUrl` se régénère à la relecture — on ne le
 * stocke jamais. L'étape 2 (dépôt Cloudflare) échoue tant que le CORS n'est pas posé.
 */
export function usePartyLogoMutations(publicId: string) {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [PARTY_KEY, 'detail', publicId] })
    // Le logo écrit `party_account.logo_url` (audité) → rafraîchir l'historique.
    queryClient.invalidateQueries({
      queryKey: [PARTY_KEY, 'history', publicId],
    })
    queryClient.invalidateQueries({ queryKey: [PARTY_KEY, 'list'] })
  }
  const set = useMutation({
    mutationFn: async (file: File) => {
      const intent = await requestLogoUploadIntent(publicId, {
        contentType: file.type,
        sizeBytes: file.size,
      })
      await uploadToStorage(intent, file)
      await confirmLogo(publicId, intent.fileKey)
    },
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: () => deletePartyLogo(publicId),
    onSuccess: invalidate,
  })
  return { set, remove }
}
