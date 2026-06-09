import { escapeHtml } from "./utils/html";
import { svgIcons } from "./utils/icons";

interface DropdownOption {
  name: string;
  value: string;
}

export class Dropdown {
  private options: DropdownOption[] = [];
  /** Indices of the currently-selected options. Single-select dropdowns keep
   *  exactly one entry; multi-select may keep zero or more. */
  private selectedOptions: number[] = [0];
  private dropdownVisible: boolean = false;
  private showInfo: boolean;
  private multipleAllowed: boolean;
  private changeCallback: { (values: string[]): void };
  // Double-click support for multi-select (e.g. "Show All" → select all).
  private doubleClickCallback: { (value: string): void } | null;
  private lastClicked = -1;
  private clickTimer: ReturnType<typeof setTimeout> | null = null;

  private elem: HTMLElement;
  private currentValueElem: HTMLDivElement;
  private menuElem: HTMLDivElement;
  private optionsElem: HTMLDivElement;
  private noResultsElem: HTMLDivElement;
  private filterInput: HTMLInputElement;

  constructor(
    id: string,
    showInfo: boolean,
    multipleAllowed: boolean,
    dropdownType: string,
    changeCallback: { (values: string[]): void },
    doubleClickCallback?: { (value: string): void }
  ) {
    this.showInfo = showInfo;
    this.multipleAllowed = multipleAllowed;
    this.changeCallback = changeCallback;
    this.doubleClickCallback = doubleClickCallback ?? null;
    this.elem = document.getElementById(id)!;

    let filter = document.createElement("div");
    filter.className = "dropdownFilter";
    this.filterInput = document.createElement("input");
    this.filterInput.className = "dropdownFilterInput";
    this.filterInput.placeholder = l10n.filterPlaceholder.replace("{0}", dropdownType);
    filter.appendChild(this.filterInput);
    this.menuElem = document.createElement("div");
    this.menuElem.className = "dropdownMenu";
    this.menuElem.appendChild(filter);
    this.optionsElem = document.createElement("div");
    this.optionsElem.className = "dropdownOptions";
    this.menuElem.appendChild(this.optionsElem);
    this.noResultsElem = document.createElement("div");
    this.noResultsElem.className = "dropdownNoResults";
    this.noResultsElem.innerHTML = l10n.noResultsFound;
    this.menuElem.appendChild(this.noResultsElem);
    this.currentValueElem = document.createElement("div");
    this.currentValueElem.className = "dropdownCurrentValue";
    this.elem.appendChild(this.currentValueElem);
    this.elem.appendChild(this.menuElem);

    document.addEventListener(
      "click",
      (e) => {
        if (!e.target) return;
        if (e.target === this.currentValueElem) {
          this.dropdownVisible = !this.dropdownVisible;
          if (this.dropdownVisible) {
            this.filterInput.value = "";
            this.filter();
          }
          this.elem.classList.toggle("dropdownOpen");
          if (this.dropdownVisible) this.filterInput.focus();
        } else if (this.dropdownVisible) {
          if ((<HTMLElement>e.target).closest(".dropdown") !== this.elem) {
            this.close();
          } else {
            let option = <HTMLElement | null>(<HTMLElement>e.target).closest(".dropdownOption");
            if (
              option !== null &&
              option.parentNode === this.optionsElem &&
              typeof option.dataset.id !== "undefined"
            ) {
              this.onOptionClick(parseInt(option.dataset.id!));
            }
          }
        }
      },
      true
    );
    document.addEventListener("contextmenu", () => this.close(), true);
    document.addEventListener(
      "keyup",
      (e) => {
        if (e.key === "Escape") this.close();
      },
      true
    );
    this.filterInput.addEventListener("keyup", () => this.filter());
  }

  /** Handle a click on the option with the given index. Single-select closes
   *  and emits when the choice changes; multi-select toggles the option,
   *  stays open, and emits the full selection. */
  private onOptionClick(index: number) {
    // A second click on the same option within the window is a double-click; in
    // multi-select it triggers the double-click action (e.g. "Show All" → select
    // all branches) instead of a normal toggle.
    const isDoubleClick = this.lastClicked === index && this.clickTimer !== null;
    if (this.clickTimer !== null) {
      clearTimeout(this.clickTimer);
      this.clickTimer = null;
    }
    if (isDoubleClick && this.multipleAllowed && this.doubleClickCallback !== null) {
      this.lastClicked = -1;
      this.doubleClickCallback(this.options[index].value);
      return;
    }
    this.lastClicked = index;
    this.clickTimer = setTimeout(() => {
      this.clickTimer = null;
      this.lastClicked = -1;
    }, 300);

    if (this.multipleAllowed) {
      const at = this.selectedOptions.indexOf(index);
      if (at > -1) {
        // Don't allow deselecting the last remaining option.
        if (this.selectedOptions.length > 1) this.selectedOptions.splice(at, 1);
        else return;
      } else {
        this.selectedOptions.push(index);
      }
      this.selectedOptions.sort((a, b) => a - b);
      this.render();
      this.changeCallback(this.selectedOptions.map((i) => this.options[i].value));
    } else {
      this.close();
      if (this.selectedOptions[0] !== index) {
        this.selectedOptions = [index];
        this.render();
        this.changeCallback([this.options[index].value]);
      }
    }
  }

  /** Set the available options and which are selected. `selected` may be a
   *  single value (single-select) or several values (multi-select); any
   *  not present in `options` are ignored, defaulting to the first option. */
  public setOptions(options: DropdownOption[], selected: string | string[]) {
    this.options = options;
    const wanted = typeof selected === "string" ? [selected] : selected;
    const indices: number[] = [];
    for (let i = 0; i < options.length; i++) {
      if (wanted.indexOf(options[i].value) > -1) indices.push(i);
    }
    this.selectedOptions = indices.length > 0 ? indices : [0];
    if (options.length <= 1) this.close();
    this.render();
  }

  /** Replace the current selection by value, re-rendering but NOT firing the
   *  change callback. Lets the owner enforce rules (e.g. mutually-exclusive
   *  "Show All Branches") after a toggle. */
  public selectValues(values: string[]) {
    const indices: number[] = [];
    for (let i = 0; i < this.options.length; i++) {
      if (values.indexOf(this.options[i].value) > -1) indices.push(i);
    }
    this.selectedOptions = indices.length > 0 ? indices : [0];
    this.render();
  }

  public refresh() {
    if (this.options.length > 0) this.render();
  }

  private render() {
    this.elem.classList.add("loaded");
    this.currentValueElem.innerHTML = escapeHtml(
      this.selectedOptions.map((i) => this.options[i].name).join(", ")
    );
    let html = "";
    for (let i = 0; i < this.options.length; i++) {
      const selected = this.selectedOptions.indexOf(i) > -1;
      html +=
        '<div class="dropdownOption' +
        (selected ? " selected" : "") +
        (this.multipleAllowed ? " multiple" : "") +
        '" data-id="' +
        i +
        '">' +
        (this.multipleAllowed
          ? '<span class="dropdownOptionCheckbox">' + (selected ? svgIcons.check : "") + "</span>"
          : "") +
        escapeHtml(this.options[i].name) +
        (this.showInfo
          ? '<div class="dropdownOptionInfo" title="' +
            escapeHtml(this.options[i].value) +
            '">' +
            svgIcons.info +
            "</div>"
          : "") +
        "</div>";
    }
    this.optionsElem.className =
      "dropdownOptions" +
      (this.showInfo ? " showInfo" : "") +
      (this.multipleAllowed ? " multiple" : "");
    this.optionsElem.innerHTML = html;
    this.filterInput.style.display = "none";
    this.noResultsElem.style.display = "none";
    this.menuElem.style.cssText = "opacity:0; display:block;";
    // Width must be at least 130px for the filter elements. Max height for the dropdown is [filter (31px) + 9.5 * dropdown item (28px) = 297px]
    // Don't need to add 12px if showing info icons and scrollbar isn't needed. The scrollbar isn't needed if: menuElem height + filter input (25px) < 297px
    this.currentValueElem.style.width =
      Math.max(
        this.menuElem.offsetWidth + (this.showInfo && this.menuElem.offsetHeight < 272 ? 0 : 12),
        130
      ) + "px";
    this.menuElem.style.cssText = "right:0; overflow-y:auto; max-height:297px;";
    if (this.dropdownVisible) this.filter();
  }

  private filter() {
    let val = this.filterInput.value.toLowerCase(),
      match,
      matches = false;
    for (let i = 0; i < this.options.length; i++) {
      match = this.options[i].name.toLowerCase().indexOf(val) > -1;
      (<HTMLElement>this.optionsElem.children[i]).style.display = match ? "block" : "none";
      if (match) matches = true;
    }
    this.filterInput.style.display = "block";
    this.noResultsElem.style.display = matches ? "none" : "block";
  }

  private close() {
    this.elem.classList.remove("dropdownOpen");
    this.dropdownVisible = false;
  }
}
