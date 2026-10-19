# Insurance workflow coverage / 保险业务覆盖

130 original extension icons in 12 functional groups. The approved 200-icon base supplies generic actions and controls. This is broad practical workflow coverage, not a universal industry inventory or a claim that a named vendor implements every workflow. Market-specific labels require local product review.

## Coverage map / 覆盖地图

- P&C: line-of-business selection → product/rate setup → risk object and application → underwriting/survey → quote/bind/issue → endorsement/renewal/cancel/reinstate → billing → FNOL/investigation/assessment/reserve/settlement/payment → recovery/salvage
- Life/annuities: needs analysis → illustration/application → insured/beneficiary → medical underwriting → issue → riders/cash value/loans/withdrawal/surrender → maturity and recurring annuity benefits; death benefits reuse beneficiary + claim settlement/payment
- Health/group: group policy/benefit plan → enrollment/eligibility → provider network/contract → prior authorization → medical claim pricing → benefit adjudication (claim-settlement) → cost sharing/accumulators → payment and benefit statement
- Distribution: producers/brokers/embedded partners → onboarding/licensing → leads/needs/quote comparison → commission rules and settlement
- Reinsurance/co-insurance: treaty/facultative → outward/inward risk allocation → share/retention → accumulation → recoveries → transaction statements
- Shared operations: identity checks/sanctions screening → accounting/reporting/capital → complaints and service providers; attachments, OCR, audit trail, workflow, analytics and integrations reuse existing generic icons

## Distinctions and intentional reuse

- Policy bind and issue are distinct: coverage commitment versus formal document issuance. Insurance certificate is evidence of coverage, not another policy.
- Cancel is general policy cancellation; surrender is the life-value transaction. Reinstate restores coverage; rewrite replaces the contract. Partial withdrawal does not end the whole policy.
- Claim reserve is an expected liability; claim payment is an actual outgoing transfer. Subrogation and salvage are different recovery sources. Reinsurance recovery is recovery from reinsurers.
- Health cost sharing is member/payer participation; co-insurance shares split an insurance risk among carriers. Label both explicitly to avoid the English “coinsurance” ambiguity.
- Underwriting referral is escalation of risk acceptance; service request is work assigned to a provider. Do not reuse either for all generic task routing.
- Claims adjudication uses claim-settlement; reinsurance statements use reinsurance-bordereau; death benefits use beneficiary plus claim-payment; outpatient/inpatient/diagnosis subtypes remain text tags unless product research establishes frequent icon navigation.
- No standalone AML, IFRS 17, tax-jurisdiction, catastrophe subtype or every medical speciality icon is promised. Use shared compliance/reporting icons and local labels; add dedicated glyphs only when justified by actual screens.


## 险种与保障对象 / Lines & insured objects

| ID | 中文 | Meaning |
|---|---|---|
| insurance-auto | 机动车保险 | Motor vehicle insurance products and insured vehicles |
| insurance-property | 财产保险 | Buildings and contents covered against property damage |
| insurance-life | 人寿保险 | Life protection products and insured lives |
| insurance-health | 健康保险 | Medical and health expense insurance products |
| insurance-accident | 意外保险 | Accidental injury and disability coverage |
| insurance-travel | 旅行保险 | Travel insurance including trip-related risks |
| insurance-liability | 责任保险 | Third-party legal liability coverage |
| insurance-commercial | 企业综合保险 | Commercial package and business risks |
| insurance-marine | 海运货物保险 | Marine cargo and transit insurance |
| insurance-engineering | 工程保险 | Construction and engineering project risks |
| insurance-cyber | 网络安全保险 | Cyber risk and incident coverage |
| insurance-surety | 保证保险 | Surety bond and performance guarantee business |

## 产品与定价 / Product & rating

| ID | 中文 | Meaning |
|---|---|---|
| product-catalog | 保险产品库 | Insurance product families and sellable plans |
| product-builder | 产品配置 | Compose product features and plan structures |
| coverage | 保障责任 | A specific insured peril or contractual benefit |
| coverage-limit | 保额与责任限额 | Maximum insured or payable amount |
| coverage-exclusion | 除外责任 | Risks or services excluded from coverage |
| insurance-deductible | 免赔额 | Insured amount borne before insurer payment |
| policy-wording | 保险条款 | Policy wording and clause libraries |
| premium-rating | 保费试算 | Calculate insurance premium from rating inputs |
| rate-table | 费率表 | Configure rating factors and rate tables |
| pricing-adjustment | 保费调整 | Discounts loadings and rating adjustments |
| product-version | 产品版本 | Effective-dated product configurations |

## 渠道与销售 / Distribution & sales

| ID | 中文 | Meaning |
|---|---|---|
| insurance-agent | 保险代理人 | Insurance producer or intermediary workspace |
| broker-network | 经纪与渠道网络 | Broker agencies and distribution hierarchy |
| partner-onboarding | 合作伙伴入驻 | Onboard distribution partners |
| producer-license | 中介资质 | Producer licenses and appointments |
| sales-lead | 销售线索 | Prospects and lead qualification |
| insurance-needs | 保障需求分析 | Assess customer insurance protection needs |
| quote-compare | 方案对比 | Compare insurance quotations or plans |
| embedded-insurance | 嵌入式保险 | Insurance offered inside partner purchase journeys |
| commission-plan | 佣金方案 | Producer compensation rules and tiers |
| commission-payment | 佣金结算 | Accrue settle and pay intermediary commissions |

## 报价与投保 / Quote & application

| ID | 中文 | Meaning |
|---|---|---|
| insurance-quote | 保险报价 | Premium quotation and proposed coverage offer |
| insurance-application | 投保申请 | New-business submission and proposal capture |
| applicant | 投保人 | Party applying for or owning an insurance contract |
| insured-person | 被保险人 | Person whose life health or other risk is insured |
| beneficiary | 受益人 | Designated recipient of policy benefits |
| insured-object | 保险标的 | Property vehicle location or other insured risk object |
| risk-questionnaire | 风险问卷 | Application risk declarations and evidence questions |
| benefit-illustration | 利益演示 | Projected policy benefits and values |
| electronic-signature | 电子签名 | Capture consented application or policy signatures |
| application-submit | 提交投保 | Submit completed application for processing |

## 核保 / Underwriting

| ID | 中文 | Meaning |
|---|---|---|
| underwriting-review | 核保审核 | Evaluate and decide new or changed insurance risk |
| risk-score | 风险评分 | Risk scoring and classification |
| risk-survey | 风险查勘 | Physical risk inspection before underwriting |
| medical-underwriting | 健康核保 | Review medical evidence for insurability |
| underwriting-rules | 核保规则 | Rules used for automated underwriting decisions |
| underwriting-referral | 核保转人工 | Refer an exception to an authorized underwriter |
| underwriting-accept | 核保通过 | Accept a risk subject to approved terms |
| underwriting-decline | 核保拒绝 | Decline an insurance application or risk |
| underwriting-conditions | 附条件承保 | Conditional acceptance and special terms |
| risk-accumulation | 风险累积 | Aggregate exposure across risks locations and policies |

## 保单全生命周期 / Policy lifecycle

| ID | 中文 | Meaning |
|---|---|---|
| policy-bind | 承保绑定 | Commit coverage before or alongside document issuance |
| policy-issue | 保单签发 | Issue the formal insurance contract |
| insurance-policy | 保险保单 | Policy record and contractual coverage details |
| insurance-certificate | 保险凭证 | Certificate evidencing coverage |
| policy-endorsement | 批单与保全 | Midterm contractual policy changes |
| policy-renewal | 保单续保 | Continue coverage into a new policy term |
| policy-cancel | 保单注销 | Cancel policy coverage |
| policy-reinstate | 保单复效 | Restore previously cancelled or lapsed coverage |
| policy-rewrite | 保单重出 | Replace or rewrite a policy as a new contract |
| policy-expiry | 保单到期 | End of a policy period or term |
| premium-audit | 保费审计 | Audit actual exposure and adjust premium |
| coverage-period | 保障期间 | Coverage effective date and term |
| policy-transfer | 保单转移 | Transfer ownership servicing or policy portfolio as configured |

## 账单与收付 / Billing & payments

| ID | 中文 | Meaning |
|---|---|---|
| premium-invoice | 保费账单 | Premium invoices and bill items |
| installment-plan | 分期计划 | Premium payment schedules and installments |
| premium-collection | 保费收款 | Collect premiums from policyholders |
| automatic-payment | 自动扣款 | Recurring authorized premium collection |
| payment-allocation | 收款分配 | Allocate receipts to accounts policies or invoices |
| payment-reconciliation | 收付对账 | Match payment receipts and accounting records |
| premium-refund | 保费退还 | Return unearned or overpaid premium |
| payment-overdue | 逾期催缴 | Delinquency and overdue premium follow-up |
| payment-failed | 支付失败 | Failed or rejected payment transaction |
| insurance-tax | 保险税费 | Premium taxes levies and related charges |
| agency-billing | 渠道账单 | Broker or agency account billing and remittance |

## 理赔 / Claims

| ID | 中文 | Meaning |
|---|---|---|
| claim-notification | 出险报案 | First notice of loss or claim intake |
| claim-case | 理赔案件 | Claim record and case workspace |
| loss-event | 损失事件 | Accident catastrophe or event causing a loss |
| claim-coverage-check | 理赔责任审核 | Confirm policy coverage for a reported loss |
| claim-assignment | 理赔分派 | Assign claim handling or adjusting responsibility |
| claim-investigation | 理赔调查 | Investigate cause circumstances and evidence |
| loss-assessment | 定损评估 | Assess damage and estimate payable loss |
| claim-reserve | 未决赔款准备金 | Reserve expected future claim payments |
| claim-settlement | 赔案理算 | Determine agreed or adjudicated claim benefit |
| claim-payment | 赔款支付 | Pay approved claim benefits to recipient |
| claim-denial | 拒赔 | Deny claim benefits with reason |
| claim-appeal | 理赔申诉 | Review disputed claim determination |
| claim-reopen | 赔案重开 | Reopen a previously closed claim |
| subrogation | 代位追偿 | Recover loss from liable third parties |
| salvage | 残值处理 | Recover dispose of or sell damaged property |
| fraud-detection | 反欺诈 | Flag and investigate suspicious insurance activity |

## 再保险与共保 / Reinsurance & coinsurance

| ID | 中文 | Meaning |
|---|---|---|
| reinsurance-treaty | 合约再保险 | Reinsurance for a defined portfolio of risks |
| reinsurance-facultative | 临时再保险 | Individually negotiated reinsurance of a risk |
| reinsurance-cession | 分出业务 | Allocate ceded risks and premium to reinsurers |
| reinsurance-assumed | 分入业务 | Accept reinsurance risk from another insurer |
| coinsurance-share | 共保份额 | Multiple insurers share an insured risk |
| reinsurance-recovery | 再保摊回 | Recover reinsurer share of claim payments |
| reinsurance-bordereau | 再保清单 | Detailed premium or claim transaction statements |
| reinsurance-retention | 自留额与分层 | Insurer retention attachment and cover layers |

## 健康险与团险 / Health & group

| ID | 中文 | Meaning |
|---|---|---|
| group-policy | 团体保单 | Master policy covering a group |
| member-enrollment | 成员参保 | Enroll members and dependents under plans |
| member-eligibility | 参保资格 | Verify eligibility dates and member status |
| benefit-plan | 福利计划 | Group or health benefit package |
| medical-provider | 医疗服务机构 | Hospital clinic or professional provider |
| provider-network | 医疗服务网络 | Participating provider network and network tiers |
| provider-contract | 医疗服务协议 | Provider fee schedules and contracting terms |
| prior-authorization | 预授权 | Approve covered health services before treatment |
| medical-claim-pricing | 医疗费用核价 | Calculate contracted provider reimbursement |
| benefit-accumulator | 保障额度累计 | Track deductible limit and out-of-pocket usage |
| cost-sharing | 医疗费用分担 | Copay coinsurance and member/payer expense share |
| benefit-statement | 理赔说明书 | Explanation of benefits and member payment responsibility |

## 寿险与年金 / Life & annuities

| ID | 中文 | Meaning |
|---|---|---|
| policy-cash-value | 保单现金价值 | Cash surrender or account value under a policy |
| policy-loan | 保单贷款 | Borrow against policy value |
| policy-surrender | 退保 | Terminate life contract and settle surrender value |
| partial-withdrawal | 部分领取 | Withdraw part of available policy value |
| fund-switch | 投资账户转换 | Transfer value among policy funds or subaccounts |
| annuity-payment | 年金给付 | Periodic annuity or retirement benefit payments |
| maturity-benefit | 满期给付 | Pay benefit at contractual maturity |
| premium-holiday | 保费缓缴 | Contract-permitted premium suspension |
| rider-benefit | 附加险保障 | Optional supplemental policy benefits |

## 合规与运营 / Compliance & operations

| ID | 中文 | Meaning |
|---|---|---|
| customer-verification | 客户身份核验 | Identity verification and due-diligence workflow |
| sanctions-screening | 制裁名单筛查 | Screen parties against restricted-party lists |
| regulatory-report | 监管报送 | Prepare jurisdiction-specific insurance submissions |
| insurance-ledger | 保险业务总账 | Insurance transaction accounting and ledger posting |
| solvency-capital | 偿付能力与资本 | Capital adequacy and solvency monitoring |
| complaint-case | 投诉管理 | Customer complaint intake and resolution |
| service-network | 服务商网络 | Repairers adjusters assistance and other vendors |
| service-request | 服务派单 | Request and track work from a service provider |
## Primary source evidence

These sources support the workflow coverage, not the proposed icon artwork or a claim that each vendor implements every entry. Labels and visual metaphors are original design proposals. Compliance items are broad workflow categories, not legal advice or a jurisdiction-specific requirements checklist.

- [Peak3 Graphene insurance core platform](https://peak3.com/graphene): supports product-rating, quote-application, underwriting, policy-lifecycle, billing-payments, claims, distribution, reinsurance
- [Peak3 Graphene v4 launch](https://peak3.com/news/peak3-launches-global-insurance-ai-dlc): supports insurance-lines, underwriting, claims, reinsurance, life-annuities
- [Guidewire policy transaction management](https://docs.guidewire.com/cloud/pc/202507/cloudapibf/cloudAPI/topics/122-PCjobTypes/04-cancellations-reinstatements/c_overview_of_policy_transaction_management.html): supports quote-application, policy-lifecycle, underwriting
- [Guidewire BillingCenter](https://www.guidewire.com/products/core-products/insurancesuite/billingcenter-insurance-billing-software): supports billing-payments, distribution
- [Guidewire recoveries and recovery reserves](https://docs.guidewire.com/cloud/is/202603/cloudapibf/cloudAPI/ClaimCenter/financials/recoveries.html): supports claims
- [Guidewire service requests](https://docs.guidewire.com/cloud/is/202603/cloudapibf/cloudAPI/ClaimCenter/fnol/service-requests/c_overview-of-service-requests-in-ClaimCenter.html): supports claims, compliance-operations
- [Oracle Health Insurance Components](https://docs.oracle.com/en/industries/insurance/health-insurance-components/index.html): supports health-group, product-rating
- [Oracle managing life and annuity policies](https://docs.oracle.com/cd/F26413_01/books/InsureSIA/managing-life-and-annuity-policies.html): supports life-annuities, quote-application
- [Sapiens life and annuities](https://sapiens.com/us/life-and-annuities/): supports life-annuities, quote-application, underwriting
- [Sapiens ReinsurancePro implementation scope](https://sapiens.com/newsroom/society-insurance-selects-sapiens-to-automate-and-transform-its-reinsurance-processes/): supports reinsurance, compliance-operations
- [SAP reinsurance documentation](https://help.sap.com/docs/FS_DATA_MANAGEMENT/67e034d1b3fc4ebcbc3514bd8da035ea/5d1af1b8241e46218f973196ea87c7aa.html): supports reinsurance
