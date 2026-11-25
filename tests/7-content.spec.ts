import { test, expect } from '../fixtures/test';
import * as allure from 'allure-js-commons';
import { step } from '../helpers/reporting';

/**
 * Content & navigation coverage for the marketing site (everything around the
 * quote funnel). These pages had no automated coverage before.
 */

// Public routes and a distinctive heading each one should render.
const CONTENT_ROUTES: { path: string; heading: string }[] = [
  { path: '/pet-insurance', heading: 'Pet Insurance' },
  { path: '/dog-insurance', heading: 'Dog Insurance' },
  { path: '/cat-insurance', heading: 'Cat Insurance' },
  { path: '/multipet-insurance', heading: 'Multi-pet Insurance' },
  { path: '/lifetime-pet-insurance', heading: 'Lifetime Pet Insurance' },
  { path: '/assist-your-paws', heading: 'Assist Your Paws' },
  { path: '/faq', heading: 'Have a question?' },
  { path: '/claims', heading: 'Claim online' },
  { path: '/about-us', heading: 'About us' },
  { path: '/contact-us', heading: "We'd love to hear from you" },
  { path: '/blog', heading: 'Latest pet insurance blog posts' },
  { path: '/refer', heading: 'Refer a friend' },
  { path: '/policy-documents', heading: 'Policy documents' },
  { path: '/cookie-policy', heading: 'Cookie Policy' },
];

// Links that must always be reachable from the footer.
const FOOTER_LINKS = [
  '/pet-insurance',
  '/cat-insurance',
  '/dog-insurance',
  '/assist-your-paws',
  '/policy-documents',
  '/faq',
  '/contact-us',
  '/blog',
  '/cookie-policy',
  '/claims',
];

// Primary header navigation links and where each must land.
const HEADER_LINKS = [
  { testId: 'faqs_lnk', name: 'FAQs', urlPart: '/faq' },
  { testId: 'claims_lnk', name: 'Claims', urlPart: '/claims' },
  { testId: 'about_us_lnk', name: 'About us', urlPart: '/about-us' },
  { testId: 'contact_us_lnk', name: 'Contact us', urlPart: '/contact-us' },
];

test.describe('Content & Navigation', () => {
  test('test:1:- @smoke should load every content route with heading, header/footer, images and working links', async ({ contentPage }) => {
    // 14 routes + a link crawl is a lot of network work, and staging can be
    // slow to serve marketing pages - give this test a bigger budget.
    test.setTimeout(420000);
    await allure.epic('Pet Insurance');
    await allure.feature('Content Pages');
    await allure.story('Route Health');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('navigation');

    // Each unique internal link is only requested once across all routes.
    const checkedLinks = new Set<string>();

    for (const route of CONTENT_ROUTES) {
      await step(`Load ${route.path} and verify it renders`, async () => {
        const status = await contentPage.openRoute(route.path);
        expect(status, `${route.path} should return a successful status`).toBeLessThan(400);
        await contentPage.verifyNoApplicationError();
        await contentPage.verifyPageHeading(
          route.heading,
          `${route.path} should show heading "${route.heading}"`,
        );
      });

      await step(`Verify ${route.path} renders the site header and footer`, async () => {
        await contentPage.verifyHeaderAndFooterVisible(route.path);
      });

      await step(`Verify ${route.path} has no broken images`, async () => {
        await contentPage.verifyNoBrokenImages(route.path);
      });

      await step(`Verify all internal links on ${route.path} are reachable`, async () => {
        const links = await contentPage.getInternalLinkUrls();
        for (const url of links) {
          if (checkedLinks.has(url)) continue;
          checkedLinks.add(url);
          await contentPage.verifyLinkReachable(url, route.path);
        }
      });
    }
  });

  test('test:2:- @smoke should launch the quote funnel from the homepage CTA', async ({ journey, homePage, petDetailsPage, basePage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Content Pages');
    await allure.story('Quote Entry Point');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('navigation');

    await step('Open the homepage', async () => {
      await journey.openHomeWithCookiesDismissed();
    });

    await step('Click "Start your quote" and land on the pet details step', async () => {
      await homePage.clickStartQuote();
      await basePage.verifyUrlMatches(/\/journey/);
      await petDetailsPage.verifyStepIndicatorActive();
    });
  });

  test('test:3:- should expose the expected footer links and navigate via the header links', async ({ journey, contentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Content Pages');
    await allure.story('Footer Links');
    await allure.severity('normal');
    await allure.tag('navigation');

    await step('Open the homepage', async () => {
      await journey.openHomeWithCookiesDismissed();
    });

    await step('Verify each expected footer link is present with the correct destination', async () => {
      for (const href of FOOTER_LINKS) {
        await contentPage.verifyFooterLinkPresent(href);
      }
    });

    await step('Verify each header link navigates to its page', async () => {
      for (const link of HEADER_LINKS) {
        await contentPage.navigateViaHeaderLink(link.testId, link.name, link.urlPart);
        await contentPage.navigate('/');
      }
    });
  });
});

/**
 * Contact Us form validation.
 *
 * The form is protected by Google reCAPTCHA, so a full end-to-end submission
 * cannot be automated reliably. These tests cover the client-side validation,
 * which runs before reCAPTCHA and is the part most likely to regress.
 */
test.describe('Contact Us', () => {
  test.beforeEach(async ({ contactPage }) => {
    await contactPage.goto();
    await contactPage.verifyLoaded();
  });

  test('test:4:- @smoke should show required-field errors when submitting an empty form', async ({ contactPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Contact Us');
    await allure.story('Form Validation');
    await allure.severity('critical');
    await allure.tag('smoke');
    await allure.tag('forms');

    await step('Submit the empty contact form', async () => {
      await contactPage.clickSubmit();
    });

    await step('Verify every required-field error is displayed', async () => {
      await contactPage.verifyAllRequiredErrorsVisible();
    });
  });

  test('test:5:- should show format errors for an invalid email and phone number', async ({ contactPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Contact Us');
    await allure.story('Form Validation');
    await allure.severity('normal');
    await allure.tag('forms');

    await step('Enter an invalid email and too-short mobile number', async () => {
      await contactPage.fillContactDetails({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'not-an-email',
        mobile: '12',
        message: 'Hello, this is a test enquiry.',
        enquiry: true,
        policyHolder: 'No',
      });
    });

    await step('Submit and verify the format validation messages appear', async () => {
      await contactPage.clickSubmit();
      await contactPage.verifyEmailFormatError();
      await contactPage.verifyMobileFormatError();
    });
  });

  test('test:6:- should pass client-side validation when all fields are valid', async ({ contactPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Contact Us');
    await allure.story('Form Validation');
    await allure.severity('normal');
    await allure.tag('forms');

    // Fill valid data BEFORE submitting: an empty submit triggers a reCAPTCHA
    // challenge overlay that would then intercept typing into the fields.
    await step('Fill the form with valid details', async () => {
      await contactPage.fillContactDetails({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        mobile: '07700900123',
        message: 'Hello, this is a valid automated test enquiry.',
        enquiry: true,
        policyHolder: 'No',
      });
    });

    await step('Submit and verify no client-side validation errors are raised', async () => {
      await contactPage.clickSubmit();
      await contactPage.verifyNoValidationErrors();
    });
  });
});

/**
 * Site features around the funnel that previously had no coverage: FAQ
 * accordion, blog articles, the referral programme embed, the customer login
 * portal, policy document PDFs and cookie-consent persistence.
 */
test.describe('Site Features', () => {
  test('test:7:- should expand and collapse FAQ accordion items', async ({ contentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Content Pages');
    await allure.story('FAQ');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Open the FAQ page', async () => {
      await contentPage.navigate('/faq');
      await contentPage.rejectCookies();
      await contentPage.verifyPageHeading('Have a question?');
    });

    await step('Verify the first question is expanded by default', async () => {
      await contentPage.verifyFirstFaqExpandedByDefault();
    });

    await step('Expand the second question and verify its answer appears', async () => {
      await contentPage.expandSecondFaqAndVerifyAnswer();
    });
  });

  test('test:8:- should open a blog article from the blog index', async ({ contentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Content Pages');
    await allure.story('Blog');
    await allure.severity('normal');
    await allure.tag('navigation');

    await step('Open the blog index', async () => {
      await contentPage.navigate('/blog');
      await contentPage.rejectCookies();
      await contentPage.verifyPageHeading('Latest pet insurance blog posts');
    });

    await step('Open the first article', async () => {
      await contentPage.openFirstBlogPost();
    });

    await step('Verify the article renders with a heading and content', async () => {
      await contentPage.verifyArticleRendered();
    });
  });

  test('test:9:- should load the Mention Me referral embed on the refer page', async ({ contentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Content Pages');
    await allure.story('Refer a Friend');
    await allure.severity('normal');
    await allure.tag('integration');

    await step('Open the refer page', async () => {
      await contentPage.navigate('/refer');
      await contentPage.rejectCookies();
      await contentPage.verifyPageHeading('Refer a friend');
    });

    await step('Verify the Mention Me iframe is embedded', async () => {
      await contentPage.verifyMentionMeEmbedAttached();
    });
  });

  test('test:10:- should link Log in to a reachable policy portal', async ({ contentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Content Pages');
    await allure.story('Customer Login');
    await allure.severity('normal');
    await allure.tag('integration');

    let portalUrl = '';

    await step('Open the homepage and locate the Log in link', async () => {
      await contentPage.navigate('/');
      await contentPage.rejectCookies();
      portalUrl = await contentPage.getLoginPortalUrl();
    });

    await step('Verify the portal responds', async () => {
      await contentPage.verifyUrlReachable(portalUrl);
    });
  });

  test('test:11:- should serve all policy document PDFs from the documents page', async ({ contentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Content Pages');
    await allure.story('Policy Documents');
    await allure.severity('critical');
    await allure.tag('integration');

    let pdfLinks: string[] = [];

    await step('Open the policy documents page and collect the PDF links', async () => {
      await contentPage.navigate('/policy-documents');
      await contentPage.rejectCookies();
      await contentPage.verifyPageHeading('Policy documents');

      pdfLinks = await contentPage.getPdfLinkUrls();
      expect(pdfLinks.length, 'Page should link at least the Policy Wording, IPID and TOBA PDFs').toBeGreaterThanOrEqual(3);
    });

    await step('Verify every PDF is reachable and served as a PDF', async () => {
      for (const url of pdfLinks) {
        await contentPage.verifyPdfServed(url);
      }
    });
  });

  test('test:12:- should not re-prompt the cookie banner after rejecting consent', async ({ contentPage }) => {
    await allure.epic('Pet Insurance');
    await allure.feature('Content Pages');
    await allure.story('Cookie Consent');
    await allure.severity('normal');
    await allure.tag('functional');

    await step('Open the homepage and reject all cookies via the banner', async () => {
      await contentPage.navigate('/');
      await contentPage.rejectCookiesViaBanner();
    });

    await step('Navigate to another page and verify the banner stays dismissed', async () => {
      await contentPage.navigate('/faq');
      await contentPage.verifyPageHeading('Have a question?');
      // Consent is stored in the OneTrust cookie, so the banner must not
      // re-prompt on subsequent page loads.
      await contentPage.verifyCookieBannerNotVisible();
    });
  });
});
