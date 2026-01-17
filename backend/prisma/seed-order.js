import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding dummy order...');

    // Get a user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No user found to associate with order.');
        return;
    }

    // Get a product
    const product = await prisma.product.findFirst();
    if (!product) {
        console.error('No product found to add to order.');
        return;
    }

    // Create an order
    const order = await prisma.order.create({
        data: {
            userId: user.id,
            totalAmount: product.price,
            shippingAddress: '123 Heritage Lane, Silk Road District',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            phone: '+91 98765 43210',
            status: 'Pending',
            items: {
                create: [
                    {
                        productId: product.id,
                        quantity: 1,
                        price: product.price,
                    },
                ],
            },
        },
    });

    console.log(`Created order with ID: ${order.id}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
