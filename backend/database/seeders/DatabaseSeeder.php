<?php

namespace Database\Seeders;

use App\Models\Business;
use App\Models\WidgetConfig;
use App\Models\KnowledgeSource;
use App\Models\TeamMember;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Feedback;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $business = Business::create([
            'name' => 'Northstar Goods',
            'email' => 'demo@northstargoods.com',
            'password' => Hash::make('demo123'),
            'domain' => 'northstargoods.com',
        ]);

        WidgetConfig::create([
            'business_id' => $business->id,
            'assistant_name' => 'Northstar Assistant',
            'welcome_message' => "Hi there! 👋 I'm here to help with any questions about our outdoor gear and policies.",
            'brand_color' => '#4f46e5',
            'position' => 'right',
            'suggested_questions' => ["What is your return policy?", "How long does shipping take?", "Help me choose a laptop bag", "Can I speak to a person?"],
            'business_hours' => ['enabled' => true, 'timezone' => 'America/New_York', 'hours' => ['mon' => ['open' => '09:00', 'close' => '18:00'], 'tue' => ['open' => '09:00', 'close' => '18:00'], 'wed' => ['open' => '09:00', 'close' => '18:00'], 'thu' => ['open' => '09:00', 'close' => '18:00'], 'fri' => ['open' => '09:00', 'close' => '18:00'], 'sat' => null, 'sun' => null]],
        ]);

        $faqs = [
            ['title' => 'Return Policy', 'content' => "We offer a hassle-free 30-day return policy on all items. Products must be unused, in original packaging, and accompanied by a receipt. Once we receive your return, refunds are processed within 5–7 business days to your original payment method. Sale items can be exchanged for store credit. To initiate a return, visit our Returns Center or contact our support team."],
            ['title' => 'Shipping Policy', 'content' => "We offer several shipping options to get your order to you quickly:\n\n• Standard Shipping: 3–5 business days (FREE on orders over $50)\n• Express Shipping: 1–2 business days ($12.99)\n• International Shipping: 7–14 business days (rates vary by destination)\n\nAll orders include tracking information sent to your email. Orders placed before 2 PM EST ship the same business day."],
            ['title' => 'Heritage Canvas Laptop Bag', 'content' => "Our Heritage Canvas Laptop Bag ($89.00) is crafted from premium waxed canvas with genuine leather accents. Features include a padded interior compartment that fits laptops up to 15\", multiple organizer pockets, adjustable shoulder strap, and brass hardware. Available in Olive, Navy, and Charcoal. Covered by our Lifetime Heritage Warranty."],
            ['title' => 'Warranty Information', 'content' => "All Northstar Goods products come with a 1-year standard warranty against manufacturing defects. Our Heritage Collection items are covered by a Lifetime Heritage Warranty. Warranty claims can be submitted through your account or by contacting support. Warranty does not cover normal wear and tear or damage from misuse."],
            ['title' => 'Payment Methods', 'content' => "We accept Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, and Google Pay. All transactions are secured with 256-bit SSL encryption. We also offer Afterpay for orders between $35 and $1,000 — split your purchase into 4 interest-free payments."],
            ['title' => 'Contact & Hours', 'content' => "Our support team is available Monday through Friday, 9:00 AM to 6:00 PM EST. You can reach us via live chat, email at support@northstargoods.com, or phone at (555) 123-4567. Response times are typically under 2 hours during business hours."],
            ['title' => 'Size Guide', 'content' => "Our apparel follows standard US sizing. For the best fit, measure your chest, waist, and hips and compare to our size chart. If you're between sizes, we recommend sizing up for a comfortable fit. Each product page includes specific measurements and fit notes."],
            ['title' => 'Gift Cards', 'content' => "Northstar Goods gift cards are available in denominations of $25, $50, $100, and $200. Gift cards are delivered via email and never expire. They can be used on any product in our store, including sale items. Gift cards cannot be returned or exchanged for cash."],
            ['title' => 'Trail Runner Pro Shoes', 'content' => "The Trail Runner Pro ($129.00) features a Vibram outsole for superior grip, breathable mesh upper, reinforced toe cap, and responsive cushioning. Designed for moderate to technical trails. Available in sizes 7-13 (men's) and 5-11 (women's). Weight: 10.2 oz per shoe."],
            ['title' => 'Order Tracking', 'content' => "Once your order ships, you'll receive a confirmation email with a tracking number. You can also track your order by logging into your account and visiting 'Order History'. If your tracking hasn't updated in 48 hours, please contact our support team for assistance."],
        ];

        foreach ($faqs as $faq) {
            KnowledgeSource::create([
                'business_id' => $business->id,
                'type' => 'faq',
                'title' => $faq['title'],
                'content' => $faq['content'],
            ]);
        }

        $admin = TeamMember::create([
            'business_id' => $business->id,
            'name' => 'Sarah Chen',
            'email' => 'sarah@northstargoods.com',
            'role' => 'admin',
            'password' => Hash::make('demo123'),
        ]);

        $agent = TeamMember::create([
            'business_id' => $business->id,
            'name' => 'Marcus Rodriguez',
            'email' => 'marcus@northstargoods.com',
            'role' => 'agent',
            'password' => Hash::make('demo123'),
        ]);

        // Conversation 1: Shipping inquiry (ai_active)
        $c1 = Conversation::create([
            'id' => Str::uuid(),
            'business_id' => $business->id, 
            'status' => 'ai_active',
            'channel' => 'widget'
        ]);
        $c1->messages()->create(['role' => 'customer', 'content' => 'How long does shipping take?']);
        $m1 = $c1->messages()->create(['role' => 'assistant', 'content' => 'We offer several shipping options: Standard Shipping takes 3-5 business days (free over $50), and Express Shipping takes 1-2 business days.', 'sources' => [['title' => 'Shipping Policy', 'type' => 'faq']]]);

        // Conversation 2: Return request (needs_human)
        $c2 = Conversation::create([
            'id' => Str::uuid(),
            'business_id' => $business->id, 
            'status' => 'needs_human',
            'customer_name' => 'Alice Smith',
            'customer_email' => 'alice@example.com',
            'channel' => 'widget'
        ]);
        $c2->messages()->create(['role' => 'customer', 'content' => 'I want to return a defective item.']);
        $c2->messages()->create(['role' => 'assistant', 'content' => 'I can help with that. To connect you to our support team, could you provide your name and email?']);
        $c2->messages()->create(['role' => 'customer', 'content' => 'Alice Smith, alice@example.com']);
        $c2->messages()->create(['role' => 'assistant', 'content' => 'Thank you. I have notified our team, and someone will be with you shortly.']);

        // Conversation 3: Product question (ai_active)
        $c3 = Conversation::create([
            'id' => Str::uuid(),
            'business_id' => $business->id, 
            'status' => 'ai_active',
            'channel' => 'widget'
        ]);
        $c3->messages()->create(['role' => 'customer', 'content' => 'Tell me about the Heritage Canvas Laptop Bag.']);
        $m3 = $c3->messages()->create(['role' => 'assistant', 'content' => 'The Heritage Canvas Laptop Bag ($89.00) is crafted from premium waxed canvas with genuine leather accents. It fits laptops up to 15" and has multiple organizer pockets.', 'sources' => [['title' => 'Heritage Canvas Laptop Bag', 'type' => 'faq']]]);

        // Conversation 4: Warranty claim (human_active)
        $c4 = Conversation::create([
            'id' => Str::uuid(),
            'business_id' => $business->id, 
            'status' => 'human_active',
            'customer_name' => 'Bob Jones',
            'customer_email' => 'bob@example.com',
            'channel' => 'widget'
        ]);
        $c4->messages()->create(['role' => 'customer', 'content' => 'My backpack strap broke, is it under warranty?']);
        $c4->messages()->create(['role' => 'assistant', 'content' => 'All our products come with a 1-year standard warranty. Let me connect you with a team member who can help.']);
        $c4->messages()->create(['role' => 'system', 'content' => 'Customer requested human handoff.']);
        $c4->messages()->create(['role' => 'agent', 'team_member_id' => $agent->id, 'content' => 'Hi Bob, I can help you with your warranty claim. Could you send over a picture of the broken strap?']);
        $c4->messages()->create(['role' => 'customer', 'content' => 'Sure, here you go. (attached photo)']);

        // Conversation 5: Gift card question (closed)
        $c5 = Conversation::create([
            'id' => Str::uuid(),
            'business_id' => $business->id, 
            'status' => 'closed',
            'channel' => 'widget'
        ]);
        $c5->messages()->create(['role' => 'customer', 'content' => 'Do gift cards expire?']);
        $m5 = $c5->messages()->create(['role' => 'assistant', 'content' => 'No, our gift cards never expire. They are delivered via email and can be used on any product in our store.', 'sources' => [['title' => 'Gift Cards', 'type' => 'faq']]]);
        
        // Feedbacks
        Feedback::create(['business_id' => $business->id, 'conversation_id' => $c1->id, 'message_id' => $m1->id, 'rating' => 'helpful']);
        Feedback::create(['business_id' => $business->id, 'conversation_id' => $c3->id, 'message_id' => $m3->id, 'rating' => 'helpful', 'comment' => 'Very detailed info, thanks!']);
        Feedback::create(['business_id' => $business->id, 'conversation_id' => $c5->id, 'message_id' => $m5->id, 'rating' => 'helpful']);
        Feedback::create(['business_id' => $business->id, 'conversation_id' => $c1->id, 'message_id' => $m1->id, 'rating' => 'unhelpful', 'comment' => 'I wanted to know about international shipping specifically.']);
        Feedback::create(['business_id' => $business->id, 'conversation_id' => $c3->id, 'message_id' => $m3->id, 'rating' => 'helpful']);
        Feedback::create(['business_id' => $business->id, 'conversation_id' => $c5->id, 'message_id' => $m5->id, 'rating' => 'helpful']);
        Feedback::create(['business_id' => $business->id, 'conversation_id' => $c1->id, 'message_id' => $m1->id, 'rating' => 'unhelpful']);
        Feedback::create(['business_id' => $business->id, 'conversation_id' => $c3->id, 'message_id' => $m3->id, 'rating' => 'helpful']);
    }
}
