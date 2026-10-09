import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../data/models/coupon_model.dart';

class CouponTicket extends StatelessWidget {
  final CouponModel coupon;
  final VoidCallback? onRedeem;
  final VoidCallback? onTap;

  const CouponTicket({
    Key? key,
    required this.coupon,
    this.onRedeem,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isGold = coupon.color == 'gold';
    final isAvailable = coupon.isAvailable;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 14),
        decoration: BoxDecoration(
          color: const Color(0xFF141816),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isGold ? AppColors.gold.withOpacity(0.4) : Colors.white.withOpacity(0.08),
            width: 1.2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.35),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Icon Stamp
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1B221E),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: coupon.isVipExclusive
                            ? AppColors.gold.withOpacity(0.5)
                            : (isGold ? AppColors.gold.withOpacity(0.3) : Colors.white.withOpacity(0.06)),
                      ),
                    ),
                    child: Icon(
                      coupon.isVipExclusive
                          ? Icons.lock_outline_rounded
                          : (isGold ? Icons.cake_outlined : Icons.confirmation_number_outlined),
                      color: coupon.isVipExclusive
                          ? AppColors.gold
                          : (isGold ? AppColors.gold : AppColors.flame),
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 14),
                  // Details
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                      coupon.code,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        color: AppColors.gold,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 13,
                                        letterSpacing: 1.2,
                                      ),
                                    ),
                                  ),
                                  if (coupon.isVipExclusive) ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF38290D),
                                        borderRadius: BorderRadius.circular(5),
                                        border: Border.all(color: AppColors.gold.withOpacity(0.5), width: 0.7),
                                      ),
                                      child: const Text(
                                        'VIP',
                                        style: TextStyle(
                                          color: AppColors.gold,
                                          fontSize: 9,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                  ] else if (coupon.targetAudience == 'NON_SUBSCRIBED') ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF163E33),
                                        borderRadius: BorderRadius.circular(5),
                                        border: Border.all(color: const Color(0xFF286D5A), width: 0.7),
                                      ),
                                      child: const Text(
                                        'GUEST',
                                        style: TextStyle(
                                          color: Color(0xFF4EE3B8),
                                          fontSize: 9,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: isAvailable
                                    ? AppColors.success.withOpacity(0.15)
                                    : const Color(0xFFE27C38).withOpacity(0.15),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: isAvailable
                                      ? AppColors.success.withOpacity(0.3)
                                      : const Color(0xFFE27C38).withOpacity(0.3),
                                  width: 0.8,
                                ),
                              ),
                              child: Text(
                                isAvailable
                                    ? '${coupon.leftCount} Left'
                                    : (coupon.status.toLowerCase() == 'expired' ? 'Expired' : 'Used & Burned'),
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isAvailable ? AppColors.success : const Color(0xFFE27C38),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 5),
                        Text(
                          coupon.name,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: isAvailable ? Colors.white : Colors.white70,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          coupon.subtitle,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.7),
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        if (coupon.burnedInvoiceNumber != null && coupon.burnedInvoiceNumber!.isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text(
                            'Settled on POS #${coupon.burnedInvoiceNumber}',
                            style: const TextStyle(
                              color: Color(0xFFD4AF37),
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Icon(Icons.location_on_outlined, size: 13, color: Colors.white.withOpacity(0.45)),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                coupon.outlet,
                                style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.55)),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            // Dashed Divider / Action Bar
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
              decoration: BoxDecoration(
                color: const Color(0xFF0F1311),
                borderRadius: const BorderRadius.vertical(bottom: Radius.circular(19)),
                border: Border(
                  top: BorderSide(color: Colors.white.withOpacity(0.06)),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    isAvailable ? 'Expires: ${coupon.expiryDate}' : 'Status: Used / Expired',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: Colors.white.withOpacity(0.55),
                    ),
                  ),
                  if (isAvailable && onRedeem != null)
                    InkWell(
                      onTap: onRedeem,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color: coupon.isVipExclusive
                              ? const Color(0xFF38290D)
                              : const Color(0xFF163E33),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: coupon.isVipExclusive
                                ? AppColors.gold.withOpacity(0.8)
                                : const Color(0xFF286D5A),
                          ),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (coupon.isVipExclusive) ...[
                              const Icon(Icons.lock_outline_rounded, size: 12, color: AppColors.gold),
                              const SizedBox(width: 4),
                            ],
                            Text(
                              coupon.isVipExclusive ? 'Unlock VIP' : 'Apply to Bill',
                              style: TextStyle(
                                color: coupon.isVipExclusive ? AppColors.gold : const Color(0xFF4EE3B8),
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    )
                  else
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.06),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.white.withOpacity(0.12)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            coupon.status.toLowerCase() == 'expired'
                                ? Icons.access_time_rounded
                                : Icons.check_circle_outline_rounded,
                            size: 12,
                            color: Colors.white.withOpacity(0.5),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            coupon.status.toLowerCase() == 'expired' ? 'EXPIRED' : 'USED & BURNED',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.5),
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
