#Contributing to Apickli

_Thank you for considering contributing to apickli._

#### **Did you find a bug?**

* **Ensure the bug was not already reported** by searching on GitHub under [Issues](https://github.com/apickli/apickli/issues).

* If you're unable to find an open issue addressing the problem, [open a new one](https://github.com/apickli/apickli/issues/new). Be sure to include a **title and clear description**, as much relevant information as possible, and a **code sample** or an **executable test case** demonstrating the expected behavior that is not occurring.

#### **Did you write a patch that fixes a bug?**

* Open a new GitHub pull request with the patch.

* Ensure the PR description clearly describes the problem and solution. Include the relevant issue number if applicable.

* Before submitting, please read the guide below to know more about coding conventions and benchmarks.

#### **Did you fix whitespace, format code, or make a purely cosmetic patch?**

Changes that are cosmetic in nature and do not add anything substantial to the stability,
 functionality, or testability of Rails will generally not be accepted (read more about [our rationales behind this decision](https://github.com/rails/rails/pull/13771#issuecomment-32746700)).

### **Code Conventions**
In lieu of a formal style guide, take care to maintain the existing coding style.
 Add unit tests for any new or changed functionality. Lint and test your code.

To test the code run `gulp test`

To test that the console outputs correctly run `gulp console-test`.
 Some of these tests should fail, that is expected behavior.
 The failed tests are designed to show how the console will output failed tests.

To lint your code run `gulp jshint`

#
Thank you for your contribution!