import React from "react"
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"

// Register font for nice professional aesthetics
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2", fontWeight: "normal" },
    { src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2", fontWeight: "bold" },
  ]
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    color: "#334155",
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: 2,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 20,
    marginBottom: 20,
  },
  businessInfo: {
    textAlign: "right",
  },
  businessName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  businessText: {
    fontSize: 9,
    color: "#64748b",
    lineHeight: 1.4,
  },
  logoBlock: {
    justifyContent: "center",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f59e0b", // Amber accent
  },
  docTitleBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 25,
  },
  docTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f59e0b", // Amber accent
  },
  metaBlock: {
    textAlign: "right",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  metaLabel: {
    fontWeight: "bold",
    color: "#475569",
    marginRight: 6,
  },
  metaValue: {
    color: "#0f172a",
  },
  billToBlock: {
    marginBottom: 25,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
  },
  billToTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  clientName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  clientText: {
    fontSize: 9,
    color: "#475569",
    lineHeight: 1.4,
  },
  // Table styles
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#0f172a", // Deep Navy
    color: "#ffffff",
    padding: 8,
    borderRadius: 4,
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    padding: 8,
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "#f8fafc", // Alternating shading
  },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1.2, textAlign: "right" },
  colTotal: { flex: 1.3, textAlign: "right", fontWeight: "bold" },
  // Summary styles
  summarySection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    marginBottom: 30,
  },
  summaryBlock: {
    width: 200,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 2,
    borderTopColor: "#f59e0b",
    marginTop: 4,
  },
  summaryLabel: {
    color: "#475569",
  },
  summaryValue: {
    fontWeight: "bold",
    color: "#0f172a",
  },
  grandTotalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0f172a",
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f59e0b", // Amber accent
  },
  // Extra Notes Section
  notesBlock: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 15,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#475569",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 8.5,
    color: "#64748b",
    lineHeight: 1.4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 15,
  },
  footerGreeting: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#f59e0b", // Amber
    marginBottom: 4,
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
  }
})

interface PDFLineItem {
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface PDFTemplateProps {
  type: "QUOTE" | "INVOICE"
  docNumber: string
  date: string
  dueDate?: string
  businessProfile: {
    business_name: string
    business_address?: string
    business_city?: string
    business_state?: string
    business_zip?: string
    business_phone?: string
    business_email?: string
  }
  clientInfo: {
    full_name: string
    company_name?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zip?: string
  }
  items: PDFLineItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  notes?: string
  terms?: string
}

export function PDFTemplate({
  type,
  docNumber,
  date,
  dueDate,
  businessProfile,
  clientInfo,
  items,
  subtotal,
  taxRate,
  taxAmount,
  total,
  notes,
  terms,
}: PDFTemplateProps) {
  const formatCurrencyPDF = (amount: number) => {
    return `$${Number(amount).toFixed(2)}`
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Block */}
        <View style={styles.header}>
          <View style={styles.logoBlock}>
            <Text style={styles.logoText}>{businessProfile.business_name || "JOBLY"}</Text>
            <Text style={[styles.businessText, { marginTop: 4 }]}>Professional Contractor Services</Text>
          </View>
          <View style={styles.businessInfo}>
            <Text style={styles.businessName}>{businessProfile.business_name}</Text>
            {businessProfile.business_address && (
              <Text style={styles.businessText}>{businessProfile.business_address}</Text>
            )}
            {(businessProfile.business_city || businessProfile.business_state) && (
              <Text style={styles.businessText}>
                {businessProfile.business_city ? `${businessProfile.business_city}, ` : ""}
                {businessProfile.business_state || ""} {businessProfile.business_zip || ""}
              </Text>
            )}
            {businessProfile.business_phone && (
              <Text style={styles.businessText}>Phone: {businessProfile.business_phone}</Text>
            )}
            {businessProfile.business_email && (
              <Text style={styles.businessText}>Email: {businessProfile.business_email}</Text>
            )}
          </View>
        </View>

        {/* Title and Meta Metadata */}
        <View style={styles.docTitleBlock}>
          <Text style={styles.docTitle}>{type}</Text>
          <View style={styles.metaBlock}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>{type === "QUOTE" ? "Quote No:" : "Invoice No:"}</Text>
              <Text style={styles.metaValue}>{docNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date:</Text>
              <Text style={styles.metaValue}>{date}</Text>
            </View>
            {dueDate && (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Due Date:</Text>
                <Text style={styles.metaValue}>{dueDate}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bill To Block */}
        <View style={styles.billToBlock}>
          <Text style={styles.billToTitle}>Bill To</Text>
          <Text style={styles.clientName}>{clientInfo.full_name}</Text>
          {clientInfo.company_name && (
            <Text style={styles.clientText}>{clientInfo.company_name}</Text>
          )}
          {clientInfo.address && (
            <Text style={styles.clientText}>{clientInfo.address}</Text>
          )}
          {(clientInfo.city || clientInfo.state) && (
            <Text style={styles.clientText}>
              {clientInfo.city ? `${clientInfo.city}, ` : ""}
              {clientInfo.state || ""} {clientInfo.zip || ""}
            </Text>
          )}
          {clientInfo.phone && (
            <Text style={styles.clientText}>Phone: {clientInfo.phone}</Text>
          )}
          {clientInfo.email && (
            <Text style={styles.clientText}>Email: {clientInfo.email}</Text>
          )}
        </View>

        {/* Table of Line Items */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Unit Price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {items.map((item, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowEven : {}]}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrencyPDF(item.unit_price)}</Text>
              <Text style={styles.colTotal}>{formatCurrencyPDF(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBlock}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal:</Text>
              <Text style={styles.summaryValue}>{formatCurrencyPDF(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax ({taxRate}%):</Text>
              <Text style={styles.summaryValue}>{formatCurrencyPDF(taxAmount)}</Text>
            </View>
            <View style={styles.summaryTotalRow}>
              <Text style={styles.grandTotalLabel}>Grand Total:</Text>
              <Text style={styles.grandTotalValue}>{formatCurrencyPDF(total)}</Text>
            </View>
          </View>
        </View>

        {/* Notes Block */}
        {notes && (
          <View style={styles.notesBlock}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}

        {/* Terms Block */}
        {terms && (
          <View style={[styles.notesBlock, { borderTopWidth: 0, paddingTop: 5 }]}>
            <Text style={styles.notesTitle}>Terms & Conditions</Text>
            <Text style={styles.notesText}>{terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerGreeting}>Thank you for your business!</Text>
          <Text style={styles.footerText}>
            If you have any questions, please contact {businessProfile.business_name} at{" "}
            {businessProfile.business_email || "our customer support"}.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
