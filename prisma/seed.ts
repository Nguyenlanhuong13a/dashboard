import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'helloconfidenc@gmail.com' },
    update: {},
    create: {
      email: 'helloconfidenc@gmail.com',
      name: 'Be Confidency',
      phone: '+1 (555) 123-4567',
      licenseNumber: 'RE-2024-NYC-001234',
      role: 'AGENT',
    }
  })

  console.log('✅ Created user:', user.name)

  // Create properties
  const propertiesData = [
    { title: "Modern Downtown Loft", address: "125 Greenwich Street", city: "Financial District", state: "NYC", price: 1250000, propertyType: "COMMERCIAL", beds: 3, baths: 2, sqft: 1850, yearBuilt: 2020, image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop", featured: true },
    { title: "Lakeside Villa", address: "4521 Lake Shore Drive", city: "Lake Tahoe", state: "CA", price: 2850000, propertyType: "LUXURY", beds: 4, baths: 3, sqft: 3200, yearBuilt: 2018, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop", featured: true },
    { title: "Urban Penthouse", address: "88 Prince Street", city: "Soho", state: "London", monthlyRent: 15000, listingType: "FOR_RENT", propertyType: "LUXURY", beds: 2, baths: 2, sqft: 1400, yearBuilt: 2019, image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop", featured: true },
    { title: "Smart City Studio", address: "200 Lafayette Street", city: "SoHo", state: "New York", price: 1450000, propertyType: "COMMERCIAL", beds: 3, baths: 2, sqft: 2250, yearBuilt: 2022, image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop", featured: true },
    { title: "Beverly Hills Mansion", address: "8801 Wilshire Blvd", city: "Beverly Hills", state: "CA", price: 8500000, propertyType: "LUXURY", beds: 7, baths: 8, sqft: 9500, yearBuilt: 2021, image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop", featured: true },
    { title: "Miami Beach Condo", address: "1000 Ocean Drive", city: "Miami Beach", state: "FL", monthlyRent: 8500, listingType: "FOR_RENT", propertyType: "VACATION", beds: 2, baths: 2, sqft: 1200, yearBuilt: 2020, image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop" },
    { title: "Chicago Investment Property", address: "2245 N Lincoln Avenue", city: "Lincoln Park", state: "IL", price: 1850000, propertyType: "INVESTMENT", beds: 6, baths: 4, sqft: 4100, yearBuilt: 1920, image: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800&h=600&fit=crop" },
    { title: "Seattle Tech Hub Office", address: "400 Broad Street", city: "Seattle", state: "WA", price: 4200000, propertyType: "COMMERCIAL", beds: 0, baths: 6, sqft: 8500, yearBuilt: 2019, image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop" },
    { title: "Austin Ranch Estate", address: "5500 Ranch Road", city: "Austin", state: "TX", price: 3200000, propertyType: "RESIDENTIAL", beds: 5, baths: 4, sqft: 4800, yearBuilt: 2017, image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&h=600&fit=crop" },
    { title: "Denver Mountain View", address: "1600 Glenarm Place", city: "Denver", state: "CO", price: 1650000, propertyType: "RESIDENTIAL", beds: 4, baths: 3, sqft: 2800, yearBuilt: 2018, image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop" },
    { title: "Malibu Oceanfront Estate", address: "21350 Pacific Coast Highway", city: "Malibu", state: "CA", price: 15000000, propertyType: "LUXURY", beds: 6, baths: 7, sqft: 7500, yearBuilt: 2023, image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=600&fit=crop", featured: true },
  ]

  for (const prop of propertiesData) {
    const price = prop.price || 0
    const monthlyRent = prop.monthlyRent || 0
    const annualRent = monthlyRent * 12
    const noi = annualRent * 0.7 || price * 0.04
    const capRate = price > 0 ? (noi / price) * 100 : 0
    const grossYield = price > 0 ? (annualRent / price) * 100 : 0
    const pricePerSqft = prop.sqft > 0 ? (price || monthlyRent * 100) / prop.sqft : 0
    const commissionAmount = price * 0.025

    await prisma.property.create({
      data: {
        ...prop,
        price,
        monthlyRent,
        listingType: (prop.listingType || 'FOR_SALE') as 'FOR_SALE' | 'FOR_RENT',
        propertyType: prop.propertyType as 'RESIDENTIAL' | 'COMMERCIAL' | 'LUXURY' | 'VACATION' | 'INVESTMENT',
        capRate,
        noi,
        grossYield,
        pricePerSqft,
        commissionRate: 2.5,
        commissionAmount,
        propertyTax: price * 0.012,
        insuranceCost: price * 0.002,
        userId: user.id,
      }
    })
  }

  console.log(`✅ Created ${propertiesData.length} properties`)

  // Create sample documents
  const documentsData = [
    { name: "Purchase Agreement - Lakeside Villa", type: "PDF", size: "2.4 MB", category: "CONTRACTS" },
    { name: "Inspection Report - Beverly Hills", type: "PDF", size: "5.1 MB", category: "REPORTS" },
    { name: "Lease Agreement - Urban Penthouse", type: "DOCX", size: "1.2 MB", category: "CONTRACTS" },
    { name: "Property Appraisal - Malibu Estate", type: "PDF", size: "3.8 MB", category: "REPORTS" },
    { name: "Insurance Policy - Chicago Investment", type: "PDF", size: "890 KB", category: "INSURANCE" },
  ]

  for (const doc of documentsData) {
    await prisma.document.create({
      data: {
        ...doc,
        url: `/documents/${doc.name.toLowerCase().replace(/ /g, '-')}.${doc.type.toLowerCase()}`,
        category: doc.category as any,
        userId: user.id,
      }
    })
  }

  console.log(`✅ Created ${documentsData.length} documents`)

  // Create sample transactions
  const transactionsData = [
    { type: "INCOME", description: "Rent - Urban Penthouse", amount: 15000 },
    { type: "INCOME", description: "Rent - Miami Beach Condo", amount: 8500 },
    { type: "EXPENSE", description: "Property Tax - Beverly Hills", amount: -8500 },
    { type: "COMMISSION", description: "Commission - Lakeside Villa", amount: 71250 },
    { type: "EXPENSE", description: "Insurance - Malibu Estate", amount: -2500 },
  ]

  for (const tx of transactionsData) {
    await prisma.transaction.create({
      data: {
        ...tx,
        type: tx.type as any,
        userId: user.id,
      }
    })
  }

  console.log(`✅ Created ${transactionsData.length} transactions`)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
