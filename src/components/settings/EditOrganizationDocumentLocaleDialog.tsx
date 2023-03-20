import { forwardRef } from 'react'
import { gql } from '@apollo/client'
import styled from 'styled-components'
import { object, string } from 'yup'
import { useFormik } from 'formik'

import { Dialog, Button, DialogRef, Typography } from '~/components/designSystem'
import { ComboBoxField } from '~/components/form'
import { useInternationalization } from '~/hooks/core/useInternationalization'
import {
  useUpdateDocumentLocaleOrganizationMutation,
  UpdateOrganizationInput,
  LagoApiError,
} from '~/generated/graphql'
import { theme } from '~/styles'
import { addToast } from '~/core/apolloClient'
import { DocumentLocales } from '~/core/translations/documentLocales'

gql`
  mutation updateDocumentLocaleOrganization($input: UpdateOrganizationInput!) {
    updateOrganization(input: $input) {
      id
      billingConfiguration {
        id
        documentLocale
      }
    }
  }
`
export interface EditOrganizationDocumentLocaleDialogRef extends DialogRef {}

interface EditOrganizationDocumentLocaleDialogProps {
  documentLocale: string
}

const documentLocalesData: { value: string; label: string }[] = Object.keys(DocumentLocales).map(
  (localeKey) => {
    return {
      value: localeKey,
      label: DocumentLocales[localeKey],
    }
  }
)

export const EditOrganizationDocumentLocaleDialog = forwardRef<
  DialogRef,
  EditOrganizationDocumentLocaleDialogProps
>(({ documentLocale }: EditOrganizationDocumentLocaleDialogProps, ref) => {
  const { translate } = useInternationalization()
  const [updateDocumentLocale] = useUpdateDocumentLocaleOrganizationMutation({
    context: { silentErrorCodes: [LagoApiError.UnprocessableEntity] },
    onCompleted(res) {
      if (res?.updateOrganization) {
        addToast({
          severity: 'success',
          translateKey: 'text_63e51ef4985f0ebd75c21349',
        })
      }
    },
  })

  const formikProps = useFormik<UpdateOrganizationInput>({
    initialValues: {
      billingConfiguration: {
        documentLocale,
      },
    },
    validationSchema: object().shape({
      billingConfiguration: object().shape({
        documentLocale: string().required(''),
      }),
    }),
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: async (values) => {
      await updateDocumentLocale({
        variables: {
          input: {
            ...values,
          },
        },
      })
    },
  })

  return (
    <Dialog
      ref={ref}
      title={translate('text_63e51ef4985f0ebd75c2130e')}
      description={translate('text_63e51ef4985f0ebd75c2130f')}
      onClickAway={() => {
        formikProps.resetForm()
        formikProps.validateForm()
      }}
      actions={({ closeDialog }) => (
        <>
          <Button
            variant="quaternary"
            onClick={() => {
              closeDialog()
              formikProps.resetForm()
            }}
          >
            {translate('text_63e51ef4985f0ebd75c21313')}
          </Button>
          <Button
            variant="primary"
            disabled={!formikProps.isValid || !formikProps.dirty}
            onClick={async () => {
              await formikProps.submitForm()
              closeDialog()
              formikProps.resetForm()
            }}
          >
            {translate('text_63e51ef4985f0ebd75c21314')}
          </Button>
        </>
      )}
    >
      <Content>
        <ComboBoxField
          disableClearable
          name="billingConfiguration.documentLocale"
          label={translate('text_63e51ef4985f0ebd75c21310')}
          helperText={
            <Typography variant="caption" html={translate('text_63e51ef4985f0ebd75c21312')} />
          }
          formikProps={formikProps}
          data={documentLocalesData}
          PopperProps={{ displayInDialog: true }}
        />
      </Content>
    </Dialog>
  )
})

const Content = styled.div`
  margin-bottom: ${theme.spacing(8)};
`

EditOrganizationDocumentLocaleDialog.displayName = 'forwardRef'
